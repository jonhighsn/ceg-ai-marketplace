import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PageAdmin from '../src/pages/PageAdmin'

const liveTiles = [
  {
    id: 'existing',
    name: 'Existing Tile',
    type: 'in-platform',
    status: 'now',
    cat: 'Testing',
    desc: 'Existing tile',
    useCase: 'Already live',
    url: 'https://example.com',
  },
]

const liveIdeas = [
  {
    id: 'idea-1',
    title: 'Existing Idea',
    problem: 'Already seeded',
    category: 'Testing',
    status: 'committed',
  },
]

describe('PageAdmin', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps tools locked until the passcode is correct', () => {
    render(<PageAdmin liveTiles={liveTiles} liveIdeas={liveIdeas} onCatalogUpdate={vi.fn()} onIdeasUpdate={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Passcode'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('Unlock'))

    expect(screen.getByText('Incorrect passcode.')).toBeInTheDocument()
    expect(screen.queryByText('Update Catalog')).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Passcode'), { target: { value: 'ceg2026' } })
    fireEvent.click(screen.getByText('Unlock'))

    expect(screen.getByText('Update Catalog')).toBeInTheDocument()
  })

  it('previews and applies valid catalog JSON via GitHub API', async () => {
    const onCatalogUpdate = vi.fn()

    // Mock GitHub PAT in localStorage
    localStorage.setItem('storefront:github-pat', 'test-token')

    // Mock the GitHub Contents API PUT
    vi.stubGlobal('fetch', vi.fn((url, opts) => {
      if (url.includes('api.github.com') && opts?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: { sha: 'new-sha-123' } }),
        })
      }
      return Promise.resolve({ ok: false })
    }))

    render(<PageAdmin liveTiles={liveTiles} liveIdeas={liveIdeas} onCatalogUpdate={onCatalogUpdate} onIdeasUpdate={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Passcode'), { target: { value: 'ceg2026' } })
    fireEvent.click(screen.getByText('Unlock'))

    const nextTiles = [
      {
        id: 'new-tile',
        name: 'New Tile',
        type: 'enterprise-skill',
        status: 'now',
        cat: 'Testing',
        desc: 'Imported tile',
        useCase: 'Import validation',
        triggers: ['new tile'],
      },
    ]
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: JSON.stringify(nextTiles) },
    })
    fireEvent.click(screen.getByText(/Apply 1 Tiles/))

    await waitFor(() => {
      expect(onCatalogUpdate).toHaveBeenCalledWith(nextTiles)
    })
  })

  it('rejects invalid catalog JSON without applying it', () => {
    const onCatalogUpdate = vi.fn()
    render(<PageAdmin liveTiles={liveTiles} liveIdeas={liveIdeas} onCatalogUpdate={onCatalogUpdate} onIdeasUpdate={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Passcode'), { target: { value: 'ceg2026' } })
    fireEvent.click(screen.getByText('Unlock'))

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: JSON.stringify([{ id: 'bad' }]) },
    })

    expect(screen.getByText(/missing required field/)).toBeInTheDocument()
    expect(onCatalogUpdate).not.toHaveBeenCalled()
  })
})
