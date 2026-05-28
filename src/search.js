import Fuse from 'fuse.js'
import { loadSearchIndex } from './search-index.js'
import { embedQuery as embedQueryWithModel, scoreSemanticEntries } from './semantic-search.js'

const TILE_KEYS = [
  { name: 'name', weight: 0.35 },
  { name: 'desc', weight: 0.25 },
  { name: 'useCase', weight: 0.2 },
  { name: 'cat', weight: 0.1 },
  { name: 'id', weight: 0.1 },
]

const IDEA_KEYS = [
  { name: 'title', weight: 0.35 },
  { name: 'problem', weight: 0.3 },
  { name: 'category', weight: 0.2 },
  { name: 'id', weight: 0.15 },
]

const MAX_RESULTS_PER_GROUP = 6
const MIN_SEMANTIC_ONLY_SCORE = 0.34

const TILE_BY_ID = (tiles) => new Map(tiles.map(tile => [tile.id, tile]))
const IDEA_BY_ID = (ideas) => new Map(ideas.map(idea => [idea.id, idea]))

const fuseSearch = (items, query, keys) => {
  if (!query || query.trim().length < 2) return []
  const fuse = new Fuse(items, { keys, threshold: 0.4, includeScore: true })
  return fuse.search(query.trim())
}

const keywordConfidence = (score) => {
  if (score < 0.15) return 'best'
  if (score < 0.35) return 'good'
  return 'related'
}

const semanticConfidence = (score) => {
  if (score >= 0.54) return 'best'
  if (score >= 0.42) return 'good'
  return 'related'
}

const resultLabel = (confidence, source) => {
  if (source === 'keyword') return confidence === 'best' ? 'Best keyword match' : 'Keyword match'
  if (source === 'semantic') return confidence === 'best' ? 'Best semantic match' : 'Semantic match'
  return confidence === 'best' ? 'Best match' : 'Good match'
}

const normalizeKeywordResults = (results, kind) =>
  results.map((result, index) => ({
    id: result.item.id,
    kind,
    item: result.item,
    keywordScore: result.score ?? 1,
    keywordRank: index + 1,
  }))

const blendResults = ({ semanticResults = [], keywordResults = [], itemById, kind }) => {
  const merged = new Map()

  semanticResults.forEach((result, index) => {
    const item = itemById.get(result.id)
    if (!item) return
    merged.set(result.id, {
      id: result.id,
      kind,
      item,
      semanticScore: result.semanticScore,
      semanticRank: index + 1,
    })
  })

  keywordResults.forEach(result => {
    const existing = merged.get(result.id) || {
      id: result.id,
      kind,
      item: result.item,
    }
    merged.set(result.id, {
      ...existing,
      keywordScore: result.keywordScore,
      keywordRank: result.keywordRank,
    })
  })

  return [...merged.values()]
    .filter(result =>
      result.keywordScore !== undefined ||
      (result.semanticScore ?? 0) >= MIN_SEMANTIC_ONLY_SCORE
    )
    .map(result => {
      const semanticSignal = Math.max(0, result.semanticScore ?? 0)
      const keywordSignal = result.keywordScore === undefined ? 0 : Math.max(0, 1 - result.keywordScore)
      const blendedScore = (semanticSignal * 0.68) + (keywordSignal * 0.32)
      const confidence = result.semanticScore !== undefined
        ? semanticConfidence(blendedScore)
        : keywordConfidence(result.keywordScore)
      const source = result.semanticScore !== undefined && result.keywordScore !== undefined
        ? 'hybrid'
        : result.semanticScore !== undefined ? 'semantic' : 'keyword'

      return {
        ...result.item,
        match: {
          confidence,
          source,
          label: resultLabel(confidence, source),
          semanticScore: result.semanticScore,
          keywordScore: result.keywordScore,
          blendedScore,
        },
        score: result.keywordScore ?? (1 - blendedScore),
        confidence: confidence === 'best' ? 'high' : 'medium',
      }
    })
    .sort((a, b) =>
      b.match.blendedScore - a.match.blendedScore ||
      (a.name || a.title || '').localeCompare(b.name || b.title || '')
    )
    .slice(0, MAX_RESULTS_PER_GROUP)
}

export const searchTiles = (tiles, query) => {
  if (!query || query.trim().length < 2) return []
  return fuseSearch(tiles, query, TILE_KEYS).map(r => ({
    ...r.item,
    score: r.score,
    confidence: r.score < 0.15 ? 'high' : 'medium',
    match: {
      confidence: keywordConfidence(r.score),
      source: 'keyword',
      label: r.score < 0.15 ? 'Best keyword match' : 'Keyword match',
      keywordScore: r.score,
      blendedScore: Math.max(0, 1 - r.score),
    },
  }))
}

export const searchIdeas = (ideas, query) => {
  if (!query || query.trim().length < 2) return []
  return fuseSearch(ideas, query, IDEA_KEYS).map(r => ({
    ...r.item,
    score: r.score,
    confidence: r.score < 0.15 ? 'high' : 'medium',
    match: {
      confidence: keywordConfidence(r.score),
      source: 'keyword',
      label: r.score < 0.15 ? 'Best keyword match' : 'Keyword match',
      keywordScore: r.score,
      blendedScore: Math.max(0, 1 - r.score),
    },
  }))
}

export const searchMarketplace = async ({
  tiles = [],
  ideas = [],
  query,
  scope = 'all',
  semanticIndex,
  loadIndex = loadSearchIndex,
  embedQuery = embedQueryWithModel,
} = {}) => {
  if (!query || query.trim().length < 2) {
    return { tiles: [], ideas: [], mode: 'empty', fallbackReason: null }
  }

  const includeTiles = scope === 'all' || scope === 'tiles'
  const includeIdeas = scope === 'all' || scope === 'ideas'
  const keywordTiles = includeTiles ? normalizeKeywordResults(fuseSearch(tiles, query, TILE_KEYS), 'tile') : []
  const keywordIdeas = includeIdeas ? normalizeKeywordResults(fuseSearch(ideas, query, IDEA_KEYS), 'idea') : []

  try {
    const index = semanticIndex || await loadIndex({ tiles, ideas })
    if (!index?.available) {
      return {
        tiles: includeTiles ? blendResults({ keywordResults: keywordTiles, itemById: TILE_BY_ID(tiles), kind: 'tile' }) : [],
        ideas: includeIdeas ? blendResults({ keywordResults: keywordIdeas, itemById: IDEA_BY_ID(ideas), kind: 'idea' }) : [],
        mode: 'keyword',
        fallbackReason: index?.reason || 'semantic-unavailable',
      }
    }

    const queryEmbedding = await embedQuery(query.trim())
    const semanticTiles = includeTiles
      ? scoreSemanticEntries({ entries: index.entries, queryEmbedding, kind: 'tile' })
      : []
    const semanticIdeas = includeIdeas
      ? scoreSemanticEntries({ entries: index.entries, queryEmbedding, kind: 'idea' })
      : []

    return {
      tiles: includeTiles ? blendResults({
        semanticResults: semanticTiles,
        keywordResults: keywordTiles,
        itemById: TILE_BY_ID(tiles),
        kind: 'tile',
      }) : [],
      ideas: includeIdeas ? blendResults({
        semanticResults: semanticIdeas,
        keywordResults: keywordIdeas,
        itemById: IDEA_BY_ID(ideas),
        kind: 'idea',
      }) : [],
      mode: 'hybrid',
      fallbackReason: null,
    }
  } catch {
    return {
      tiles: includeTiles ? blendResults({ keywordResults: keywordTiles, itemById: TILE_BY_ID(tiles), kind: 'tile' }) : [],
      ideas: includeIdeas ? blendResults({ keywordResults: keywordIdeas, itemById: IDEA_BY_ID(ideas), kind: 'idea' }) : [],
      mode: 'keyword',
      fallbackReason: 'semantic-error',
    }
  }
}
