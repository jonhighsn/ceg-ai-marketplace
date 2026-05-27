import { describe, expect, it } from 'vitest'
import {
  filterCatalogByQuery,
  normalizeIdeaStatus,
  parseUnifiedSearch,
  sortCatalogTiles,
} from '../src/helpers'

describe('catalog helpers', () => {
  it('sorts tiles by type order and then by name', () => {
    const sorted = sortCatalogTiles([
      { id: 'z', type: 'enterprise-skill', name: 'Zeta' },
      { id: 'b', type: 'in-platform', name: 'Beta' },
      { id: 'a', type: 'in-platform', name: 'Alpha' },
      { id: 'l', type: 'local-skill', name: 'Local' },
    ])

    expect(sorted.map((tile) => tile.id)).toEqual(['a', 'b', 'z', 'l'])
  })

  it('filters against name, description, use case, category, and id', () => {
    const tiles = [
      {
        id: 'renewal-risk',
        name: 'Renewal Risk',
        desc: 'Finds churn signals',
        useCase: 'Renewal prep',
        cat: 'Risk Management',
      },
      {
        id: 'meeting-brief',
        name: 'Meeting Brief',
        desc: 'Creates agendas',
        useCase: 'Prep calls',
        cat: 'Account Intelligence',
      },
    ]

    expect(filterCatalogByQuery(tiles, '').map((tile) => tile.id)).toEqual([
      'renewal-risk',
      'meeting-brief',
    ])
    expect(filterCatalogByQuery(tiles, 'churn').map((tile) => tile.id)).toEqual([
      'renewal-risk',
    ])
    expect(filterCatalogByQuery(tiles, 'account').map((tile) => tile.id)).toEqual([
      'meeting-brief',
    ])
  })

  it('normalizes legacy idea statuses', () => {
    expect(normalizeIdeaStatus('planned')).toBe('committed')
    expect(normalizeIdeaStatus('in-progress')).toBe('committed')
    expect(normalizeIdeaStatus('shipped')).toBe('delivered')
    expect(normalizeIdeaStatus('under-review')).toBe('under-review')
  })

  it('parses unified and legacy AI result shapes safely', () => {
    expect(parseUnifiedSearch('{"catalog":[{"id":"a"}],"ideas":[{"id":"i"}]}')).toEqual({
      catalog: [{ id: 'a' }],
      ideas: [{ id: 'i' }],
    })
    expect(parseUnifiedSearch('```json\n{"recommendations":[{"id":"legacy"}]}\n```')).toEqual({
      catalog: [{ id: 'legacy' }],
      ideas: [],
    })
    expect(parseUnifiedSearch('not json')).toEqual({ catalog: [], ideas: [] })
  })
})
