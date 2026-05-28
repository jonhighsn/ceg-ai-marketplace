import { describe, expect, it, vi } from 'vitest'
import { searchMarketplace, searchTiles } from './search'

const tiles = [
  {
    id: 'renewal',
    name: 'AI Renewal Intelligence',
    desc: 'Renewal advisor with risk assessment and outreach guidance.',
    useCase: 'Renewal coming up.',
    cat: 'Renewals',
    triggers: ['renewal prep'],
  },
  {
    id: 'handoff',
    name: 'Sales-to-Post-Sale Brief',
    desc: 'Creates a handoff brief for new customers.',
    useCase: 'New logo just closed.',
    cat: 'Account Intelligence',
  },
]

const ideas = [
  {
    id: 'pipeline-1',
    title: 'Pre-Interlock Intelligence Agent',
    problem: 'Generates account brief for new account assignment.',
    category: 'Account Intelligence',
  },
]

describe('searchMarketplace', () => {
  it('preserves keyword search for exact matches', () => {
    const results = searchTiles(tiles, 'renewal')

    expect(results[0].id).toBe('renewal')
    expect(results[0].match.source).toBe('keyword')
  })

  it('ranks semantic matches that do not share exact query words', async () => {
    const results = await searchMarketplace({
      tiles,
      ideas,
      query: 'help me prepare for a renewal conversation',
      semanticIndex: {
        available: true,
        entries: [
          { id: 'renewal', kind: 'tile', embedding: [1, 0] },
          { id: 'handoff', kind: 'tile', embedding: [0, 1] },
          { id: 'pipeline-1', kind: 'idea', embedding: [0.8, 0.2] },
        ],
      },
      embedQuery: vi.fn(async () => [1, 0]),
    })

    expect(results.mode).toBe('hybrid')
    expect(results.tiles[0].id).toBe('renewal')
    expect(results.tiles[0].match.source).toMatch(/hybrid|semantic/)
    expect(results.ideas[0].id).toBe('pipeline-1')
  })

  it('drops weak semantic-only matches instead of returning the whole catalog', async () => {
    const manyTiles = Array.from({ length: 20 }, (_, index) => ({
      id: `weak-${index}`,
      name: `Weak ${index}`,
      desc: 'Unrelated capability',
      useCase: 'Unrelated work',
      cat: 'Other',
    }))

    const results = await searchMarketplace({
      tiles: [
        {
          id: 'qir-generator',
          name: 'QIR Generator',
          desc: 'Builds QIR research briefs',
          useCase: 'Prepare QIR research',
          cat: 'Account Intelligence',
        },
        ...manyTiles,
      ],
      ideas,
      query: 'QIR Research',
      semanticIndex: {
        available: true,
        entries: [
          { id: 'qir-generator', kind: 'tile', embedding: [1, 0] },
          ...manyTiles.map((tile, index) => ({
            id: tile.id,
            kind: 'tile',
            embedding: [0.2 - (index * 0.001), 0.98],
          })),
          { id: 'pipeline-1', kind: 'idea', embedding: [1, 0] },
        ],
      },
      embedQuery: async () => [1, 0],
    })

    expect(results.tiles.map(tile => tile.id)).toEqual(['qir-generator'])
    expect(results.ideas.map(idea => idea.id)).toEqual(['pipeline-1'])
  })

  it('falls back to keyword results when semantic search is unavailable', async () => {
    const results = await searchMarketplace({
      tiles,
      ideas,
      query: 'handoff',
      semanticIndex: { available: false, reason: 'stale-index', entries: [] },
      embedQuery: vi.fn(async () => {
        throw new Error('should not embed')
      }),
    })

    expect(results.mode).toBe('keyword')
    expect(results.fallbackReason).toBe('stale-index')
    expect(results.tiles[0].id).toBe('handoff')
  })

  it('does not load semantic search for very short queries', async () => {
    const loadIndex = vi.fn()
    const results = await searchMarketplace({ tiles, ideas, query: 'q', loadIndex })

    expect(results.mode).toBe('empty')
    expect(loadIndex).not.toHaveBeenCalled()
  })
})
