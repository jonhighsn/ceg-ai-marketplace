import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'

const catalogResponse = {
  version: '2026-05-27T12:00:00Z',
  tiles: [
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
  ],
  ideas: [
    {
      id: 'idea-fetch',
      title: 'Fetched Idea',
      problem: 'Loaded from JSON',
      category: 'Testing',
      status: 'committed',
    },
  ],
}

describe('App data loading', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders fetched catalog data after the loading state', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(catalogResponse),
    })))

    render(<App />)

    expect(screen.getByText('Loading catalog...')).toBeInTheDocument()
    expect(await screen.findByText('Fetched Tile')).toBeInTheDocument()
  })

  it('uses fallback data when catalog fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve(null),
    })))

    render(<App />)

    expect(await screen.findByText('Ask AI: Account Executive Summary')).toBeInTheDocument()
  })

  it('uses fallback data when catalog JSON is malformed', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tiles: [] }),
    })))

    render(<App />)

    expect(await screen.findByText('Ask AI: Account Executive Summary')).toBeInTheDocument()
  })

  it('navigates to the pipeline via the storefront nav event', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(catalogResponse),
    })))

    render(<App />)
    await screen.findByText('Fetched Tile')

    window.dispatchEvent(new CustomEvent('storefront:nav', { detail: 'submit' }))

    await waitFor(() => {
      expect(screen.getByText('Fetched Idea')).toBeInTheDocument()
    })
  })
})
