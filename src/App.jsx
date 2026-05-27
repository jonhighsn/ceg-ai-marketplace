import { useEffect, useState } from 'react'
import {
  STORAGE_CATALOG_KEY,
  STORAGE_IDEAS_SEEDED_KEY,
} from './constants'
import { IDEAS_FALLBACK, TILES_FALLBACK } from './data-fallback'
import storage from './storage'
import { Sidebar } from './components/Sidebar'
import PageAdmin from './pages/PageAdmin'
import PageBrowse from './pages/PageBrowse'
import PageHome from './pages/PageHome'
import PageIdeaPortal from './pages/PageIdeaPortal'

const DATA_BASE = import.meta.env.BASE_URL

const isUsableArray = (value) => Array.isArray(value) && value.length > 0

const fetchJsonArray = async (path, fallback) => {
  try {
    const response = await fetch(`${DATA_BASE}${path}`)
    if (!response.ok) return fallback

    const payload = await response.json()
    return isUsableArray(payload) ? payload : fallback
  } catch {
    return fallback
  }
}

const loadStoredArray = async (key) => {
  try {
    const record = await storage.get(key, true)
    if (!record?.value) return null

    const parsed = JSON.parse(record.value)
    return isUsableArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export default function App() {
  const [page, setPage] = useState('home')
  const [liveTiles, setLiveTiles] = useState([])
  const [liveIdeas, setLiveIdeas] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const [fetchedTiles, fetchedIdeas] = await Promise.all([
        fetchJsonArray('data/tiles.json', TILES_FALLBACK),
        fetchJsonArray('data/ideas.json', IDEAS_FALLBACK),
      ])

      const [storedTiles, storedIdeas] = await Promise.all([
        loadStoredArray(STORAGE_CATALOG_KEY),
        loadStoredArray(STORAGE_IDEAS_SEEDED_KEY),
      ])

      if (!cancelled) {
        setLiveTiles(storedTiles ?? fetchedTiles)
        setLiveIdeas(storedIdeas ?? fetchedIdeas)
        setDataLoaded(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handler = (event) => setPage(event.detail)
    window.addEventListener('storefront:nav', handler)
    return () => window.removeEventListener('storefront:nav', handler)
  }, [])

  if (!dataLoaded) {
    return (
      <div className="loading-screen">
        Loading catalog...
      </div>
    )
  }

  const PageComponent = {
    home: PageHome,
    browse: PageBrowse,
    submit: PageIdeaPortal,
    admin: PageAdmin,
  }[page] || PageHome

  return (
    <div className="marketplace-app">
      <Sidebar page={page} onPage={setPage} tiles={liveTiles} />
      <main className="marketplace-main">
        {page === 'admin' ? (
          <PageAdmin
            liveTiles={liveTiles}
            onCatalogUpdate={setLiveTiles}
            liveIdeas={liveIdeas}
            onIdeasUpdate={setLiveIdeas}
          />
        ) : (
          <PageComponent tiles={liveTiles} ideas={liveIdeas} />
        )}
      </main>
    </div>
  )
}
