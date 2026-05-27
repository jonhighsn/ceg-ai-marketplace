import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'

const fetchedTiles = [
  {
    id: 'test-fetch-tile',
    name: 'Fetched Tile',
    type: 'in-platform',
    status: 'now',
    cat: 'Testing',
    desc: 'Fetched from JSON',
    useCase: 'Verify data loading',
    url: 'https://example.com',
  },
]

const fetchedIdeas = [
  {
    id: 'idea-fetch',
    title: 'Fetched Idea',
    problem: 'Loaded from JSON',
    category: 'Testing',
    status: 'committed',
  },
]

describe('App data loading', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders fetched JSON data after the loading state', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(String(url).includes('tiles') ? fetchedTiles : fetchedIdeas),
    })))

    render(<App />)

    expect(screen.getByText('Loading catalog...')).toBeInTheDocument()
    expect(await screen.findByText('Fetched Tile')).toBeInTheDocument()
  })

  it('uses fallback data when catalog JSON fails', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (String(url).includes('tiles')) {
        return Promise.resolve({ ok: false, json: () => Promise.resolve([]) })
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve(fetchedIdeas) })
    }))

    render(<App />)

    expect(await screen.findByText('Ask AI: Account Executive Summary')).toBeInTheDocument()
  })

  it('lets stored catalog overrides win over fetched JSON', async () => {
    localStorage.setItem('storefront:catalog-override', JSON.stringify([
      {
        id: 'override-tile',
        name: 'Override Tile',
        type: 'in-platform',
        status: 'now',
        cat: 'Testing',
        desc: 'Stored override',
        useCase: 'Verify override precedence',
        url: 'https://example.com',
      },
    ]))
    vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(String(url).includes('tiles') ? fetchedTiles : fetchedIdeas),
    })))

    render(<App />)

    expect(await screen.findByText('Override Tile')).toBeInTheDocument()
    expect(screen.queryByText('Fetched Tile')).not.toBeInTheDocument()
  })

  it('navigates to the pipeline via the storefront nav event', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(String(url).includes('tiles') ? fetchedTiles : fetchedIdeas),
    })))

    render(<App />)
    await screen.findByText('Fetched Tile')

    window.dispatchEvent(new CustomEvent('storefront:nav', { detail: 'submit' }))

    await waitFor(() => {
      expect(screen.getByText('Fetched Idea')).toBeInTheDocument()
    })
  })
})
