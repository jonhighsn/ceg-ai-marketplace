import { describe, expect, it } from 'vitest'
import {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_RUNTIME,
  SEARCH_INDEX_SCHEMA_VERSION,
  computeCatalogFingerprint,
  validateSearchIndex,
} from './search-index'

const tiles = [{ id: 'renewal', name: 'Renewal Advisor' }]
const ideas = [{ id: 'handoff', title: 'Handoff Agent' }]

const validIndex = () => ({
  schemaVersion: SEARCH_INDEX_SCHEMA_VERSION,
  source: {
    fingerprint: computeCatalogFingerprint({ tiles, ideas }),
  },
  model: {
    id: DEFAULT_EMBEDDING_MODEL,
    runtime: DEFAULT_EMBEDDING_RUNTIME,
    dimension: 2,
  },
  entries: [
    { id: 'renewal', kind: 'tile', embedding: [1, 0] },
    { id: 'handoff', kind: 'idea', embedding: [0, 1] },
  ],
})

describe('validateSearchIndex', () => {
  it('accepts a valid index for the current catalog fingerprint', () => {
    const result = validateSearchIndex(validIndex(), { tiles, ideas })

    expect(result.available).toBe(true)
    expect(result.entries).toHaveLength(2)
  })

  it('rejects stale indexes when source data changes', () => {
    const result = validateSearchIndex(validIndex(), {
      tiles: [...tiles, { id: 'new', name: 'New Tile' }],
      ideas,
    })

    expect(result.available).toBe(false)
    expect(result.reason).toBe('stale-index')
  })

  it('rejects incompatible model metadata', () => {
    const index = validIndex()
    index.model.id = 'other-model'

    const result = validateSearchIndex(index, { tiles, ideas })

    expect(result.available).toBe(false)
    expect(result.reason).toBe('model-mismatch')
  })

  it('filters malformed entries without throwing', () => {
    const index = validIndex()
    index.entries.push({ id: 'broken', kind: 'tile', embedding: [1] })

    const result = validateSearchIndex(index, { tiles, ideas })

    expect(result.available).toBe(true)
    expect(result.entries.map(entry => entry.id)).toEqual(['renewal', 'handoff'])
  })
})
