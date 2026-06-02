import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../../components/SearchBar'

describe('SearchBar', () => {
  it('renders the title input and search button', () => {
    render(<SearchBar onSearch={vi.fn()} loading={false} />)
    expect(screen.getByLabelText('Search by title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('renders type filter pills', () => {
    render(<SearchBar onSearch={vi.fn()} loading={false} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Movies' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Series' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Episodes' })).toBeInTheDocument()
  })

  it('calls onSearch with trimmed query on submit', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.type(screen.getByLabelText('Search by title'), '  Inception  ')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith({ query: 'Inception', type: '', year: '' })
  })

  it('does not call onSearch when query is empty', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('does not call onSearch when query is only whitespace', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.type(screen.getByLabelText('Search by title'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('disables the search button while loading', () => {
    render(<SearchBar onSearch={vi.fn()} loading={true} />)
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
  })

  it('includes selected type in search payload', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'Movies' }))
    await userEvent.type(screen.getByLabelText('Search by title'), 'Batman')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith({ query: 'Batman', type: 'movie', year: '' })
  })

  it('includes year in search payload', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.type(screen.getByLabelText('Search by title'), 'Batman')
    await userEvent.type(screen.getByLabelText('Filter by year'), '2022')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith({ query: 'Batman', type: '', year: '2022' })
  })

  it('marks the active type pill with aria-pressed=true', async () => {
    render(<SearchBar onSearch={vi.fn()} loading={false} />)
    const moviesBtn = screen.getByRole('button', { name: 'Movies' })
    await userEvent.click(moviesBtn)
    expect(moviesBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('submits via Enter key', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.type(screen.getByLabelText('Search by title'), 'Dune{Enter}')
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ query: 'Dune' }))
  })
})
