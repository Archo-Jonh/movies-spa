import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useFavorites } from '../../hooks/useFavorites'

const STORAGE_KEY = 'movie-spa:favorites'

const movie1 = { imdbID: 'tt1', Title: 'Inception', Year: '2010', Poster: 'N/A' }
const movie2 = { imdbID: 'tt2', Title: 'Avatar',    Year: '2009', Poster: 'N/A' }

describe('useFavorites', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
  })

  it('adds a movie to favorites', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0].imdbID).toBe('tt1')
  })

  it('removes a movie on second toggle (toggle off)', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    act(() => result.current.toggle(movie1))
    expect(result.current.favorites).toHaveLength(0)
  })

  it('does not duplicate the same movie', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    act(() => result.current.toggle(movie1))
    act(() => result.current.toggle(movie1))
    expect(result.current.favorites.length).toBeLessThanOrEqual(1)
  })

  it('can hold multiple different movies', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    act(() => result.current.toggle(movie2))
    expect(result.current.favorites).toHaveLength(2)
  })

  it('stamps addedAt timestamp on save', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    expect(result.current.favorites[0].addedAt).toBeTypeOf('number')
  })

  it('isFavorite returns true for a saved movie', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    expect(result.current.isFavorite('tt1')).toBe(true)
  })

  it('isFavorite returns false for an unsaved movie', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.isFavorite('tt99')).toBe(false)
  })

  it('persists favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored[0].imdbID).toBe('tt1')
  })

  it('loads persisted favorites from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...movie1, addedAt: 999 }]))
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites[0].imdbID).toBe('tt1')
  })

  it('recovers gracefully from corrupt localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json')
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
  })

  it('updateFavoriteData patches a field on a saved movie', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    act(() => result.current.updateFavoriteData('tt1', { Genre: 'Sci-Fi' }))
    expect(result.current.favorites[0].Genre).toBe('Sci-Fi')
  })

  it('updateFavoriteData is a no-op for an unknown imdbID', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle(movie1))
    const before = result.current.favorites.length
    act(() => result.current.updateFavoriteData('tt99', { Genre: 'Drama' }))
    expect(result.current.favorites.length).toBe(before)
  })

  it('updateFavoriteData skips re-render when value is unchanged', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle({ ...movie1, Genre: 'Action' }))
    const before = result.current.favorites
    act(() => result.current.updateFavoriteData('tt1', { Genre: 'Action' }))
    // Same reference means no state update fired
    expect(result.current.favorites).toBe(before)
  })
})
