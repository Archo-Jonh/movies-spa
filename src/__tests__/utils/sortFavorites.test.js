import { describe, it, expect } from 'vitest'
import { sortFavorites } from '../../utils/sortFavorites'

const base = [
  { imdbID: 'tt1', Title: 'Zorro',  Genre: 'Action',     addedAt: 1000 },
  { imdbID: 'tt2', Title: 'Avatar', Genre: 'Drama',      addedAt: 3000 },
  { imdbID: 'tt3', Title: 'Batman', Genre: 'Action',     addedAt: 2000 },
]

describe('sortFavorites', () => {
  it('sorts A-Z by title', () => {
    const sorted = sortFavorites(base, 'az')
    expect(sorted.map((m) => m.Title)).toEqual(['Avatar', 'Batman', 'Zorro'])
  })

  it('sorts by first genre alphabetically', () => {
    const sorted = sortFavorites(base, 'genre')
    expect(sorted.map((m) => m.imdbID)).toEqual(['tt1', 'tt3', 'tt2'])
  })

  it('sorts by date descending (most recently added first)', () => {
    const sorted = sortFavorites(base, 'date')
    expect(sorted.map((m) => m.imdbID)).toEqual(['tt2', 'tt3', 'tt1'])
  })

  it('defaults to date sort for unknown sort key', () => {
    const sorted = sortFavorites(base, 'unknown')
    expect(sorted.map((m) => m.imdbID)).toEqual(['tt2', 'tt3', 'tt1'])
  })

  it('does not mutate the original array', () => {
    const copy = [...base]
    sortFavorites(base, 'az')
    expect(base).toEqual(copy)
  })

  it('places items with no genre last when sorting by genre', () => {
    const items = [
      { imdbID: 'tt4', Title: 'X', Genre: null,     addedAt: 0 },
      { imdbID: 'tt1', Title: 'A', Genre: 'Action', addedAt: 0 },
    ]
    const sorted = sortFavorites(items, 'genre')
    expect(sorted[0].Genre).toBe('Action')
    expect(sorted[1].Genre).toBeNull()
  })

  it('handles addedAt = undefined gracefully in date sort', () => {
    const items = [
      { imdbID: 'tt1', Title: 'A', addedAt: undefined },
      { imdbID: 'tt2', Title: 'B', addedAt: 5000 },
    ]
    const sorted = sortFavorites(items, 'date')
    expect(sorted[0].imdbID).toBe('tt2')
  })

  it('returns empty array when input is empty', () => {
    expect(sortFavorites([], 'az')).toEqual([])
  })
})
