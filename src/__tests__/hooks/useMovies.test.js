import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMovies } from '../../hooks/useMovies'
import * as omdb from '../../services/omdb'

vi.mock('../../services/omdb')

const SEARCH_RESPONSE = {
  Search: [
    { imdbID: 'tt1', Title: 'Inception', Year: '2010', Type: 'movie', Poster: 'N/A' },
    { imdbID: 'tt2', Title: 'Avatar',    Year: '2009', Type: 'movie', Poster: 'N/A' },
  ],
  totalResults: '2',
}

const PAGE_2_RESPONSE = {
  Search: [
    { imdbID: 'tt3', Title: 'Dune', Year: '2021', Type: 'movie', Poster: 'N/A' },
  ],
  totalResults: '3',
}

const mockDetail = (id) => ({
  imdbID: id,
  Response: 'True',
  Genre: 'Sci-Fi, Action',
  Plot: 'A great story.',
})

describe('useMovies', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    omdb.searchMovies.mockResolvedValue(SEARCH_RESPONSE)
    omdb.getMovieDetail.mockImplementation((id) => Promise.resolve(mockDetail(id)))
  })

  it('initialises with empty state', () => {
    const { result } = renderHook(() => useMovies())
    expect(result.current.movies).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets loading=true while search is in flight', async () => {
    omdb.searchMovies.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useMovies())
    act(() => { result.current.search({ query: 'inception' }) })
    expect(result.current.loading).toBe(true)
  })

  it('populates movies and total after a successful search', async () => {
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'inception' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.movies).toHaveLength(2)
    expect(result.current.total).toBe(2)
  })

  it('resets page to 1 on new search', async () => {
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'inception' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // page is internal, but we verify via loadMore behaviour
    expect(omdb.searchMovies).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
  })

  it('sets error and keeps movies empty on API failure', async () => {
    omdb.searchMovies.mockRejectedValue(new Error('Movie not found!'))
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'xyznotreal' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Movie not found!')
    expect(result.current.movies).toHaveLength(0)
  })

  it('clears error on a subsequent successful search', async () => {
    omdb.searchMovies
      .mockRejectedValueOnce(new Error('Not found'))
      .mockResolvedValueOnce(SEARCH_RESPONSE)
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'bad' }))
    await waitFor(() => expect(result.current.error).not.toBeNull())
    await act(() => result.current.search({ query: 'inception' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('updates movies with Genre and Plot after background fetch resolves', async () => {
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'inception' }))
    await waitFor(() =>
      expect(result.current.movies.some((m) => m.Genre !== undefined)).toBe(true)
    )
    expect(result.current.movies[0].Genre).toBe('Sci-Fi, Action')
    expect(result.current.movies[0].Plot).toBe('A great story.')
  })

  it('hasMore is false when all results fit on one page', async () => {
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'inception' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // totalResults=2 and we loaded 2
    expect(result.current.hasMore).toBe(false)
  })

  it('hasMore is true when more results exist', async () => {
    omdb.searchMovies.mockResolvedValue({ ...SEARCH_RESPONSE, totalResults: '20' })
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'inception' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasMore).toBe(true)
  })

  it('loadMore appends new results', async () => {
    omdb.searchMovies
      .mockResolvedValueOnce({ ...SEARCH_RESPONSE, totalResults: '3' })
      .mockResolvedValueOnce(PAGE_2_RESPONSE)
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'test' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.loadingMore).toBe(false))
    expect(result.current.movies).toHaveLength(3)
  })

  it('loadMore requests the next page number', async () => {
    omdb.searchMovies
      .mockResolvedValueOnce({ ...SEARCH_RESPONSE, totalResults: '20' })
      .mockResolvedValueOnce({ Search: [], totalResults: '20' })
    const { result } = renderHook(() => useMovies())
    await act(() => result.current.search({ query: 'test' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.loadMore())
    expect(omdb.searchMovies).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
  })
})
