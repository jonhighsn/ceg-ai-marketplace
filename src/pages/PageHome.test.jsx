import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PageHome from './PageHome'
import { searchMarketplace } from '../search'

vi.mock('../search', () => ({
  searchMarketplace: vi.fn(),
}))

const tiles = [
  {
    id: 'renewal',
    name: 'AI Renewal Intelligence',
    type: 'enterprise-skill',
    status: 'now',
    desc: 'Renewal advisor',
    cat: 'Renewals',
    match: { label: 'Best semantic match', confidence: 'best' },
  },
]

const ideas = [
  {
    id: 'pipeline-1',
    title: 'Pre-Interlock Intelligence Agent',
    problem: 'Prepares account handoffs',
    category: 'Account Intelligence',
    match: { label: 'Semantic match', confidence: 'good' },
  },
]

describe('PageHome search', () => {
  beforeEach(() => {
    searchMarketplace.mockReset()
  })

  it('renders hybrid catalog and pipeline results for a natural-language query', async () => {
    searchMarketplace.mockResolvedValue({ tiles, ideas, mode: 'hybrid' })

    render(<PageHome tiles={tiles} ideas={ideas} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. QBR, account intelligence, automation...'), {
      target: { value: 'help me prepare for renewal' },
    })
    fireEvent.click(screen.getByLabelText('Search →'))

    await waitFor(() => expect(screen.getByText('AI Renewal Intelligence')).toBeInTheDocument())
    expect(screen.getByText('Pre-Interlock Intelligence Agent')).toBeInTheDocument()
    expect(screen.getByText('Best semantic match')).toBeInTheDocument()
  })

  it('does not render stale results after the query changes mid-search', async () => {
    let resolveSearch
    searchMarketplace.mockReturnValue(new Promise(resolve => { resolveSearch = resolve }))

    render(<PageHome tiles={tiles} ideas={ideas} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. QBR, account intelligence, automation...'), {
      target: { value: 'renewal' },
    })
    fireEvent.click(screen.getByLabelText('Search →'))
    fireEvent.change(screen.getByPlaceholderText('e.g. QBR, account intelligence, automation...'), {
      target: { value: 'handoff' },
    })

    resolveSearch({ tiles, ideas: [], mode: 'hybrid' })

    await waitFor(() => expect(screen.queryByText('AI Renewal Intelligence')).not.toBeInTheDocument())
  })
})
