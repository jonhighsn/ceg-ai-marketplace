import { DEFAULT_EMBEDDING_MODEL } from './search-index.js'

let embedderPromise = null

export const normalizeVector = (vector) => {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
  if (!magnitude) return vector.map(() => 0)
  return vector.map(value => value / magnitude)
}

export const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0
  return a.reduce((sum, value, index) => sum + value * b[index], 0)
}

export const tileSearchText = (tile) => [
  tile.name,
  tile.cat,
  tile.desc,
  tile.useCase,
  ...(Array.isArray(tile.triggers) ? tile.triggers : []),
].filter(Boolean).join('\n')

export const ideaSearchText = (idea) => [
  idea.title,
  idea.category,
  idea.problem,
].filter(Boolean).join('\n')

export const createSearchEntries = ({ tiles = [], ideas = [], embed }) => {
  if (typeof embed !== 'function') {
    throw new TypeError('createSearchEntries requires an embed function')
  }

  return [
    ...tiles.map(tile => ({
      id: tile.id,
      kind: 'tile',
      text: tileSearchText(tile),
      embedding: normalizeVector(embed(tileSearchText(tile))),
    })),
    ...ideas.map(idea => ({
      id: idea.id,
      kind: 'idea',
      text: ideaSearchText(idea),
      embedding: normalizeVector(embed(ideaSearchText(idea))),
    })),
  ]
}

const loadEmbedder = async () => {
  if (!embedderPromise) {
    embedderPromise = import('@huggingface/transformers')
      .then(async ({ pipeline, env }) => {
        env.allowLocalModels = false
        return pipeline('feature-extraction', DEFAULT_EMBEDDING_MODEL, { dtype: 'q8' })
      })
  }
  return embedderPromise
}

export const embedQuery = async (query) => {
  const extractor = await loadEmbedder()
  const output = await extractor(query, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

export const scoreSemanticEntries = ({ entries = [], queryEmbedding, limit = 20, kind }) => {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) return []
  const normalizedQuery = normalizeVector(queryEmbedding)

  return entries
    .filter(entry => !kind || entry.kind === kind)
    .map(entry => ({
      id: entry.id,
      kind: entry.kind,
      semanticScore: cosineSimilarity(normalizedQuery, entry.embedding),
    }))
    .filter(result => Number.isFinite(result.semanticScore))
    .sort((a, b) => b.semanticScore - a.semanticScore || a.id.localeCompare(b.id))
    .slice(0, limit)
}
