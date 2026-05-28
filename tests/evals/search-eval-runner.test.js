import { describe, expect, it, beforeAll } from 'vitest'
import { searchMarketplace, searchTiles } from '../../src/search.js'
import { tileSearchText, ideaSearchText } from '../../src/semantic-search.js'
import evalCases from './search-eval-data.json' assert { type: 'json' }
import tilesData from '../../public/data/tiles.json' assert { type: 'json' }
import ideasData from '../../public/data/ideas.json' assert { type: 'json' }

const tiles = tilesData
const ideas = ideasData

const recall = (resultIds, expectedIds) => {
  if (expectedIds.length === 0) return 1
  const found = expectedIds.filter(id => resultIds.includes(id))
  return found.length / expectedIds.length
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

const buildSemanticIndex = ({ tiles, ideas }) => {
  const VOCAB_SIZE = 128
  const tokenize = (text) => text.toLowerCase().split(/\s+/).filter(Boolean)
  const hash = (word) => {
    let h = 0
    for (let i = 0; i < word.length; i++) h = ((h << 5) - h + word.charCodeAt(i)) | 0
    return h
  }

  const toVector = (words) => {
    const vec = new Float32Array(VOCAB_SIZE)
    for (const w of words) {
      const idx = Math.abs(hash(w)) % VOCAB_SIZE
      vec[idx] += 1
    }
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
    return Array.from(vec.map(v => v / mag))
  }

  const entries = [
    ...tiles.map(tile => ({
      id: tile.id,
      kind: 'tile',
      embedding: toVector(tokenize(tileSearchText(tile))),
    })),
    ...ideas.map(idea => ({
      id: idea.id,
      kind: 'idea',
      embedding: toVector(tokenize(ideaSearchText(idea))),
    })),
  ]

  const embedQuery = async (query) => toVector(tokenize(query))
  return { available: true, reason: null, entries, embedQuery }
}

const index = buildSemanticIndex({ tiles, ideas })

const printReport = (label, rows, kind) => {
  const expectedKey = kind === 'tile' ? 'expectedTiles' : 'expectedIdeas'
  const returnedKey = kind === 'tile' ? 'returnedTileIds' : 'returnedIdeaIds'
  const recallKey = kind === 'tile' ? 'tileRecall' : 'ideaRecall'

  const withExpectations = rows.filter(r => r[expectedKey].length > 0)
  const passCount = withExpectations.filter(r => r[recallKey] > 0).length
  const passRate = withExpectations.length === 0 ? 1 : passCount / withExpectations.length
  const avgRecall = withExpectations.length === 0 ? 1
    : withExpectations.reduce((sum, r) => sum + r[recallKey], 0) / withExpectations.length

  console.log(`\n=== ${label} — ${kind.toUpperCase()} ===`)
  console.log(`  Pass rate: ${(passRate * 100).toFixed(0)}% (${passCount}/${withExpectations.length})`)
  console.log(`  Avg recall: ${(avgRecall * 100).toFixed(0)}%`)

  const failures = withExpectations.filter(r => r[recallKey] === 0)
  if (failures.length > 0) {
    console.log('  Failures:')
    failures.forEach(f => {
      console.log(`    [${f.id}] "${f.query}" — expected [${f[expectedKey]}] got [${f[returnedKey]}]`)
    })
  }

  return { passRate, avgRecall, passCount, total: withExpectations.length }
}

// ── Keyword-only evals ──

describe('search eval: keyword-only', () => {
  evalCases.forEach(evalCase => {
    it(`[${evalCase.id}] "${evalCase.query}"`, () => {
      const results = searchTiles(tiles, evalCase.query)
      const scored = scoreGroup(results, evalCase.expectedTiles)

      if (evalCase.expectedTiles.length > 0) {
        expect(scored.recall, `tile recall for "${evalCase.query}"`).toBeGreaterThan(0)
      }
    })
  })
})

// ── Hybrid evals (mock semantic) ──

describe('search eval: hybrid (mock semantic)', () => {
  evalCases.forEach(evalCase => {
    it(`[${evalCase.id}] "${evalCase.query}"`, async () => {
      const results = await searchMarketplace({
        tiles, ideas, query: evalCase.query,
        semanticIndex: index, embedQuery: index.embedQuery,
      })

      const tileScored = scoreGroup(results.tiles, evalCase.expectedTiles)
      const ideaScored = scoreGroup(results.ideas, evalCase.expectedIdeas)

      if (evalCase.expectedTiles.length > 0) {
        expect(tileScored.recall, `tile recall for "${evalCase.query}"`).toBeGreaterThan(0)
      }
      if (evalCase.expectedIdeas.length > 0) {
        expect(ideaScored.recall, `idea recall for "${evalCase.query}"`).toBeGreaterThan(0)
      }
    })
  })
})

// ── Summary (runs all evals, collects stats, prints report) ──

describe('search eval: summary report', () => {
  it('keyword-only summary', () => {
    const rows = evalCases.map(evalCase => {
      const results = searchTiles(tiles, evalCase.query)
      const scored = scoreGroup(results, evalCase.expectedTiles)
      return {
        id: evalCase.id,
        query: evalCase.query,
        expectedTiles: evalCase.expectedTiles,
        returnedTileIds: scored.returnedIds,
        tileRecall: scored.recall,
      }
    })

    const report = printReport('Keyword-Only', rows, 'tile')
    expect(report.passRate, 'keyword pass rate >= 40%').toBeGreaterThanOrEqual(0.4)
  })

  it('hybrid (mock semantic) summary', async () => {
    const rows = []
    for (const evalCase of evalCases) {
      const results = await searchMarketplace({
        tiles, ideas, query: evalCase.query,
        semanticIndex: index, embedQuery: index.embedQuery,
      })

      const tileScored = scoreGroup(results.tiles, evalCase.expectedTiles)
      const ideaScored = scoreGroup(results.ideas, evalCase.expectedIdeas)

      rows.push({
        id: evalCase.id,
        query: evalCase.query,
        expectedTiles: evalCase.expectedTiles,
        expectedIdeas: evalCase.expectedIdeas,
        returnedTileIds: tileScored.returnedIds,
        returnedIdeaIds: ideaScored.returnedIds,
        tileRecall: tileScored.recall,
        ideaRecall: ideaScored.recall,
      })
    }

    const tileReport = printReport('Hybrid (Mock Semantic)', rows, 'tile')
    const ideaReport = printReport('Hybrid (Mock Semantic)', rows, 'idea')
    const overall = (tileReport.passRate + ideaReport.passRate) / 2
    expect(overall, 'hybrid overall pass rate >= 55%').toBeGreaterThanOrEqual(0.55)
  })
})
