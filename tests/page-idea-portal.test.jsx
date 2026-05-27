import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PageIdeaPortal from '../src/pages/PageIdeaPortal'

const ideas = [
  {
    id: 'idea-1',
    title: 'Risk Mitigation Agent',
    problem: 'Drafts a mitigation plan for CSM review.',
    category: 'Risk Management',
    status: 'planned',
  },
]

describe('PageIdeaPortal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('normalizes legacy statuses and renders seeded ideas', () => {
    render(<PageIdeaPortal ideas={ideas} tiles={[]} />)

    expect(screen.getByText('Risk Mitigation Agent')).toBeInTheDocument()
    expect(screen.getAllByText('Committed').length).toBeGreaterThan(0)
  })

  it('increments a vote once and persists vote state', async () => {
    render(<PageIdeaPortal ideas={ideas} tiles={[]} />)

    fireEvent.click(screen.getByTitle('Upvote this idea'))

    await waitFor(() => {
      expect(screen.getByTitle("You've already upvoted this")).toBeDisabled()
    })
    expect(JSON.parse(localStorage.getItem('storefront:idea-votes'))).toEqual({ 'idea-1': 1 })
    expect(JSON.parse(localStorage.getItem('storefront:user-votes'))).toEqual(['idea-1'])
  })

  it('restores already-voted ideas from local storage', async () => {
    localStorage.setItem('storefront:idea-votes', JSON.stringify({ 'idea-1': 3 }))
    localStorage.setItem('storefront:user-votes', JSON.stringify(['idea-1']))

    render(<PageIdeaPortal ideas={ideas} tiles={[]} />)

    await waitFor(() => {
      expect(screen.getByTitle("You've already upvoted this")).toBeDisabled()
    })
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows an AI-unavailable state when discovery search fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('CORS'))))
    render(<PageIdeaPortal ideas={ideas} tiles={[]} />)

    fireEvent.click(screen.getByText('Submit New Idea'))
    fireEvent.change(screen.getByPlaceholderText(/Auto-generate a QBR deck/), {
      target: { value: 'Need a QBR assistant' },
    })
    fireEvent.click(screen.getByLabelText('Check Catalog →'))

    expect(await screen.findByText(/AI search is not available/)).toBeInTheDocument()
  })
})
