import { pipeline, env } from '@huggingface/transformers'
import { searchMarketplace, searchTiles } from '../../src/search.js'
import { tileSearchText, ideaSearchText, normalizeVector, cosineSimilarity } from '../../src/semantic-search.js'
import { readFileSync } from 'fs'

const evalCases = JSON.parse(readFileSync(new URL('./search-eval-data.json', import.meta.url)))
const tilesData = JSON.parse(readFileSync(new URL('../../public/data/tiles.json', import.meta.url)))
const ideasData = JSON.parse(readFileSync(new URL('../../public/data/ideas.json', import.meta.url)))

const tiles = tilesData
const ideas = ideasData

const recall = (resultIds, expectedIds) => {
  if (expectedIds.length === 0) return 1
  return expectedIds.filter(id => resultIds.includes(id)).length / expectedIds.length
}

const reciprocalRank = (resultIds, expectedId) => {
  const rank = resultIds.indexOf(expectedId)
  return rank === -1 ? 0 : 1 / (rank + 1)
}

const scoreGroup = (results, expectedIds) => {
  const resultIds = results.map(r => r.id)
  return {
    recall: recall(resultIds, expectedIds),
    mrr: expectedIds.length > 0
      ? expectedIds.reduce((sum, id) => sum + reciprocalRank(resultIds, id), 0) / expectedIds.length
      : null,
    returnedIds: resultIds,
  }
}

const report = (label, rows, kind) => {
  const ek = kind === 'tile' ? 'expectedTiles' : 'expectedIdeas'
  const rk = kind === 'tile' ? 'returnedTileIds' : 'returnedIdeaIds'
  const ck = kind === 'tile' ? 'tileRecall' : 'ideaRecall'
  const mk = kind === 'tile' ? 'tileMrr' : 'ideaMrr'
  const withExp = rows.filter(r => r[ek].length > 0)
  const pass = withExp.filter(r => r[ck] > 0).length
  const rate = withExp.length === 0 ? 1 : pass / withExp.length
  const avgR = withExp.length === 0 ? 1 : withExp.reduce((s, r) => s + r[ck], 0) / withExp.length
  const withMrr = withExp.filter(r => r[mk] !== null)
  const avgMrr = withMrr.length === 0 ? 0 : withMrr.reduce((s, r) => s + r[mk], 0) / withMrr.length
  const fails = withExp.filter(r => r[ck] === 0)

  console.log(`\n=== ${label} — ${kind.toUpperCase()} ===`)
  console.log(`  Pass: ${(rate * 100).toFixed(0)}% (${pass}/${withExp.length})  Avg recall: ${(avgR * 100).toFixed(0)}%  Avg MRR: ${avgMrr.toFixed(2)}`)
  if (fails.length) {
    console.log('  Failures:')
    fails.forEach(f => console.log(`    [${f.id}] "${f.query}" — want [${f[ek]}] got [${f[rk]}]`))
  }
  return { rate, avgR, avgMrr, pass, total: withExp.length }
}

console.log('Loading all-MiniLM-L6-v2...')
env.allowLocalModels = false
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' })
console.log('Model loaded.\n')

const embed = async (text) => {
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

// Build real semantic index
console.log('Building embeddings for catalog...')
const tileEntries = []
for (const tile of tiles) {
  const text = tileSearchText(tile)
  tileEntries.push({ id: tile.id, kind: 'tile', text, embedding: normalizeVector(await embed(text)) })
}
const ideaEntries = []
for (const idea of ideas) {
  const text = ideaSearchText(idea)
  ideaEntries.push({ id: idea.id, kind: 'idea', text, embedding: normalizeVector(await embed(text)) })
}
const index = { available: true, reason: null, entries: [...tileEntries, ...ideaEntries] }
console.log(`Embedded ${tileEntries.length} tiles + ${ideaEntries.length} ideas.\n`)

// Keyword-only
console.log('='.repeat(60))
const kwRows = evalCases.map(c => {
  const s = scoreGroup(searchTiles(tiles, c.query), c.expectedTiles)
  return { id: c.id, query: c.query, expectedTiles: c.expectedTiles, returnedTileIds: s.returnedIds, tileRecall: s.recall, tileMrr: s.mrr }
})
report('Keyword-Only', kwRows, 'tile')

// Hybrid with real embeddings
console.log('\n' + '='.repeat(60))
console.log('Running hybrid eval with real embeddings...')
const hyRows = []
for (const c of evalCases) {
  const queryEmbedding = await embed(c.query)
  const r = await searchMarketplace({ tiles, ideas, query: c.query, semanticIndex: index, embedQuery: async () => queryEmbedding })
  const ts = scoreGroup(r.tiles, c.expectedTiles)
  const is = scoreGroup(r.ideas, c.expectedIdeas)
  hyRows.push({
    id: c.id, query: c.query,
    expectedTiles: c.expectedTiles, expectedIdeas: c.expectedIdeas,
    returnedTileIds: ts.returnedIds, returnedIdeaIds: is.returnedIds,
    tileRecall: ts.recall, ideaRecall: is.recall,
    tileMrr: ts.mrr, ideaMrr: is.mrr,
  })
}
const ht = report('Hybrid (Real Embeddings)', hyRows, 'tile')
const hi = report('Hybrid (Real Embeddings)', hyRows, 'idea')
console.log(`\n  Overall hybrid pass rate: ${((ht.rate + hi.rate) / 2 * 100).toFixed(0)}%`)
