import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DiscoverySubmit from './DiscoverySubmit'
import { searchMarketplace } from '../../search'

vi.mock('../../search', () => ({
  searchMarketplace: vi.fn(),
}))

const tiles = [
  {
    id: 'handoff',
    name: 'Sales-to-Post-Sale Brief',
    type: 'enterprise-skill',
    desc: 'Creates a handoff brief',
    match: { label: 'Best match', confidence: 'best' },
  },
]

describe('DiscoverySubmit search', () => {
  beforeEach(() => {
    searchMarketplace.mockReset()
  })

  it('shows matching catalog capabilities before idea submission', async () => {
    searchMarketplace.mockResolvedValue({ tiles, ideas: [], mode: 'hybrid' })

    render(<DiscoverySubmit tiles={tiles} ideas={[]} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. QBR deck, account data, automation...'), {
      target: { value: 'new account handoff' },
    })
    fireEvent.click(screen.getByLabelText('Check Catalog →'))

    await waitFor(() => expect(screen.getByText('Sales-to-Post-Sale Brief')).toBeInTheDocument())
    expect(screen.getByText('Best match')).toBeInTheDocument()
  })

  it('keeps the no-match submission path available', async () => {
    searchMarketplace.mockResolvedValue({ tiles: [], ideas: [], mode: 'keyword' })

    render(<DiscoverySubmit tiles={[]} ideas={[]} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. QBR deck, account data, automation...'), {
      target: { value: 'something new' },
    })
    fireEvent.click(screen.getByLabelText('Check Catalog →'))

    await waitFor(() => expect(screen.getByText('Nothing in the catalog covers this yet.')).toBeInTheDocument())
  })

  it('does not show stale catalog results after the query changes mid-search', async () => {
    let resolveSearch
    searchMarketplace.mockReturnValue(new Promise(resolve => { resolveSearch = resolve }))

    render(<DiscoverySubmit tiles={tiles} ideas={[]} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. QBR deck, account data, automation...'), {
      target: { value: 'handoff' },
    })
    fireEvent.click(screen.getByLabelText('Check Catalog →'))
    fireEvent.change(screen.getByPlaceholderText('e.g. QBR deck, account data, automation...'), {
      target: { value: 'new idea' },
    })

    resolveSearch({ tiles, ideas: [], mode: 'hybrid' })

    await waitFor(() => expect(screen.queryByText('Sales-to-Post-Sale Brief')).not.toBeInTheDocument())
  })
})
