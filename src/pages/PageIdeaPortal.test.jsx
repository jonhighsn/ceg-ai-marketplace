import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PageIdeaPortal from './PageIdeaPortal'
import { searchMarketplace } from '../search'

vi.mock('../search', () => ({
  searchMarketplace: vi.fn(),
}))

const ideas = [
  {
    id: 'pipeline-1',
    title: 'Pre-Interlock Intelligence Agent',
    problem: 'Generates account brief for assignment',
    category: 'Account Intelligence',
    status: 'committed',
  },
  {
    id: 'pipeline-2',
    title: 'Support Intelligence Agent',
    problem: 'Surfaces support cases',
    category: 'Risk Management',
    status: 'under-review',
  },
]

describe('PageIdeaPortal search', () => {
  beforeEach(() => {
    searchMarketplace.mockReset()
  })

  it('filters semantic idea results by selected status', async () => {
    searchMarketplace.mockResolvedValue({ ideas, tiles: [], mode: 'hybrid' })

    render(<PageIdeaPortal ideas={ideas} tiles={[]} />)

    fireEvent.change(screen.getByPlaceholderText('Search ideas by title, category, or description...'), {
      target: { value: 'account handoff' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Committed (1)' }))

    await waitFor(() => expect(screen.getByText('Pre-Interlock Intelligence Agent')).toBeInTheDocument())
    expect(screen.queryByText('Support Intelligence Agent')).not.toBeInTheDocument()
  })
})
