import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline, env } from '@huggingface/transformers'
import {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_RUNTIME,
  SEARCH_INDEX_SCHEMA_VERSION,
  computeCatalogFingerprint,
} from '../src/search-index.js'
import { ideaSearchText, normalizeVector, tileSearchText } from '../src/semantic-search.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const argValue = (name, fallback) => {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : process.argv[index + 1]
}

const readJson = async (relativePath, fallback) => {
  try {
    return JSON.parse(await fs.readFile(path.resolve(repoRoot, relativePath), 'utf8'))
  } catch {
    return fallback
  }
}

const loadCatalog = async () => {
  const catalogPath = argValue('--catalog', null)
  if (catalogPath) {
    const catalog = await readJson(catalogPath, {})
    return {
      tiles: Array.isArray(catalog.tiles) ? catalog.tiles : [],
      ideas: Array.isArray(catalog.ideas) ? catalog.ideas : [],
    }
  }

  return {
    tiles: await readJson(argValue('--tiles', 'public/data/tiles.json'), []),
    ideas: await readJson(argValue('--ideas', 'public/data/ideas.json'), []),
  }
}

const createEmbedder = async (modelId) => {
  env.allowLocalModels = false
  const extractor = await pipeline('feature-extraction', modelId, { dtype: 'q8' })

  return async (text) => {
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    return normalizeVector(Array.from(output.data))
  }
}

const main = async () => {
  const modelId = argValue('--model', DEFAULT_EMBEDDING_MODEL)
  const outPath = argValue('--out', 'public/data/search-index.json')
  const { tiles, ideas } = await loadCatalog()

  if (!tiles.length && !ideas.length) {
    throw new Error('No catalog tiles or ideas found to index')
  }

  const embed = await createEmbedder(modelId)
  const entries = []

  for (const tile of tiles) {
    entries.push({
      id: tile.id,
      kind: 'tile',
      text: tileSearchText(tile),
      embedding: await embed(tileSearchText(tile)),
    })
  }

  for (const idea of ideas) {
    entries.push({
      id: idea.id,
      kind: 'idea',
      text: ideaSearchText(idea),
      embedding: await embed(ideaSearchText(idea)),
    })
  }

  const dimension = entries[0]?.embedding?.length || 0
  const index = {
    schemaVersion: SEARCH_INDEX_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      fingerprint: computeCatalogFingerprint({ tiles, ideas }),
      tileCount: tiles.length,
      ideaCount: ideas.length,
    },
    model: {
      id: modelId,
      runtime: DEFAULT_EMBEDDING_RUNTIME,
      dimension,
      pooling: 'mean',
      normalize: true,
    },
    entries,
  }

  const absoluteOut = path.resolve(repoRoot, outPath)
  await fs.mkdir(path.dirname(absoluteOut), { recursive: true })
  await fs.writeFile(absoluteOut, `${JSON.stringify(index)}\n`)
  console.log(`Wrote ${entries.length} semantic search entries to ${outPath}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
