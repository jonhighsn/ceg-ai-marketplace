export const SEARCH_INDEX_SCHEMA_VERSION = 1
export const SEARCH_INDEX_PATH = 'data/search-index.json'
export const DEFAULT_EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
export const DEFAULT_EMBEDDING_RUNTIME = '@huggingface/transformers'

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, stableValue(value[key])])
    )
  }
  return value
}

export const stableStringify = (value) => JSON.stringify(stableValue(value))

export const hashString = (value) => {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const computeCatalogFingerprint = ({ tiles = [], ideas = [] } = {}) =>
  hashString(stableStringify({ tiles, ideas }))

export const normalizeCatalogPayload = (payload = {}) => {
  if (Array.isArray(payload)) {
    return { tiles: payload, ideas: [] }
  }

  return {
    tiles: Array.isArray(payload.tiles) ? payload.tiles : [],
    ideas: Array.isArray(payload.ideas) ? payload.ideas : [],
  }
}

const hasValidVector = (entry, dimension) =>
  Array.isArray(entry?.embedding) &&
  entry.embedding.length === dimension &&
  entry.embedding.every(value => Number.isFinite(value))

export const validateSearchIndex = (
  index,
  {
    tiles = [],
    ideas = [],
    modelId = DEFAULT_EMBEDDING_MODEL,
    runtime = DEFAULT_EMBEDDING_RUNTIME,
  } = {}
) => {
  if (!index || typeof index !== 'object') {
    return { available: false, reason: 'missing-index', entries: [] }
  }

  if (index.schemaVersion !== SEARCH_INDEX_SCHEMA_VERSION) {
    return { available: false, reason: 'schema-version-mismatch', entries: [] }
  }

  if (index.model?.id !== modelId || index.model?.runtime !== runtime) {
    return { available: false, reason: 'model-mismatch', entries: [] }
  }

  const dimension = index.model?.dimension
  if (!Number.isInteger(dimension) || dimension <= 0) {
    return { available: false, reason: 'invalid-dimension', entries: [] }
  }

  const expectedFingerprint = computeCatalogFingerprint({ tiles, ideas })
  if (index.source?.fingerprint !== expectedFingerprint) {
    return { available: false, reason: 'stale-index', entries: [] }
  }

  if (!Array.isArray(index.entries)) {
    return { available: false, reason: 'invalid-entries', entries: [] }
  }

  const entries = index.entries.filter(entry =>
    ['tile', 'idea'].includes(entry?.kind) &&
    typeof entry.id === 'string' &&
    hasValidVector(entry, dimension)
  )

  if (entries.length === 0) {
    return { available: false, reason: 'empty-index', entries: [] }
  }

  return {
    available: true,
    reason: null,
    entries,
    model: index.model,
    source: index.source,
  }
}

export const loadSearchIndex = async ({
  tiles = [],
  ideas = [],
  fetchImpl = globalThis.fetch,
  baseUrl = import.meta.env.BASE_URL || '/',
  indexUrls = [`${baseUrl}${SEARCH_INDEX_PATH}`],
} = {}) => {
  if (typeof fetchImpl !== 'function') {
    return { available: false, reason: 'fetch-unavailable', entries: [] }
  }

  for (const indexUrl of indexUrls) {
    try {
      const response = await fetchImpl(indexUrl)
      if (!response.ok) continue
      const index = await response.json()
      const validated = validateSearchIndex(index, { tiles, ideas })
      if (validated.available) return validated
    } catch {
      // Try the next configured index URL before falling back to keyword search.
    }
  }

  return { available: false, reason: 'index-load-error', entries: [] }
}
