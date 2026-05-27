import Fuse from 'fuse.js'

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

export const searchTiles = (tiles, query) => {
  if (!query || query.trim().length < 2) return []
  const fuse = new Fuse(tiles, { keys: TILE_KEYS, threshold: 0.4, includeScore: true })
  return fuse.search(query.trim()).map(r => ({
    ...r.item,
    score: r.score,
    confidence: r.score < 0.15 ? 'high' : 'medium',
  }))
}

export const searchIdeas = (ideas, query) => {
  if (!query || query.trim().length < 2) return []
  const fuse = new Fuse(ideas, { keys: IDEA_KEYS, threshold: 0.4, includeScore: true })
  return fuse.search(query.trim()).map(r => ({
    ...r.item,
    score: r.score,
    confidence: r.score < 0.15 ? 'high' : 'medium',
  }))
}
