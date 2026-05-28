import { describe, expect, it } from 'vitest'
import {
  cosineSimilarity,
  createSearchEntries,
  normalizeVector,
  scoreSemanticEntries,
} from './semantic-search'

describe('semantic-search utilities', () => {
  it('normalizes vectors before cosine scoring', () => {
    expect(normalizeVector([3, 4])).toEqual([0.6, 0.8])
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
  })

  it('creates tile and idea entries with normalized embeddings', () => {
    const entries = createSearchEntries({
      tiles: [{ id: 'tile-1', name: 'Renewal Advisor', cat: 'Renewals' }],
      ideas: [{ id: 'idea-1', title: 'Handoff Agent', problem: 'Prepare account handoffs' }],
      embed: text => text.includes('Renewal') ? [2, 0] : [0, 3],
    })

    expect(entries).toEqual([
      expect.objectContaining({ id: 'tile-1', kind: 'tile', embedding: [1, 0] }),
      expect.objectContaining({ id: 'idea-1', kind: 'idea', embedding: [0, 1] }),
    ])
  })

  it('scores matching entries by semantic similarity', () => {
    const results = scoreSemanticEntries({
      entries: [
        { id: 'renewal', kind: 'tile', embedding: [1, 0] },
        { id: 'handoff', kind: 'tile', embedding: [0, 1] },
      ],
      queryEmbedding: [0.9, 0.1],
      kind: 'tile',
    })

    expect(results[0]).toEqual(expect.objectContaining({ id: 'renewal' }))
  })
})
