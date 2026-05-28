import { useEffect, useRef, useState } from 'react'
import { CATALOG_FALLBACK } from './data-fallback'
import { DATA_RAW_URL } from './constants'
import { Sidebar } from './components/Sidebar'
import PageAdmin from './pages/PageAdmin'
import PageBrowse from './pages/PageBrowse'
import PageHome from './pages/PageHome'
import PageIdeaPortal from './pages/PageIdeaPortal'

const POLL_INTERVAL = 30 * 60 * 1000

const isUsableArray = (value) => Array.isArray(value) && value.length > 0

async function fetchCatalog() {
  try {
    const response = await fetch(DATA_RAW_URL)
    if (!response.ok) return null

    const payload = await response.json()
    if (!payload || !isUsableArray(payload.tiles)) return null

    return payload
  } catch {
    return null
  }
}

export default function App() {
  const [page, setPage] = useState('home')
  const [liveTiles, setLiveTiles] = useState([])
  const [liveIdeas, setLiveIdeas] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const versionRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const catalog = await fetchCatalog()

      if (!cancelled) {
        if (catalog) {
          versionRef.current = catalog.version
          setLiveTiles(catalog.tiles)
          setLiveIdeas(catalog.ideas || [])
        } else {
          setLiveTiles(CATALOG_FALLBACK.tiles)
          setLiveIdeas(CATALOG_FALLBACK.ideas)
        }
        setDataLoaded(true)
      }
    })()

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      const catalog = await fetchCatalog()
      if (catalog && catalog.version !== versionRef.current) {
        versionRef.current = catalog.version
        setLiveTiles(catalog.tiles)
        setLiveIdeas(catalog.ideas || [])
      }
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
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
