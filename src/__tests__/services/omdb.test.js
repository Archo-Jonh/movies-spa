import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchMovies, getMovieDetail } from '../../services/omdb'

function mockFetch(body, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  })
}

describe('omdb service', () => {
  beforeEach(() => vi.resetAllMocks())

  describe('searchMovies', () => {
    it('returns Search array on success', async () => {
      mockFetch({
        Response: 'True',
        Search: [{ imdbID: 'tt1', Title: 'Inception' }],
        totalResults: '1',
      })
      const data = await searchMovies({ query: 'inception' })
      expect(data.Search).toHaveLength(1)
      expect(data.totalResults).toBe('1')
    })

    it('throws the API error message when Response is False', async () => {
      mockFetch({ Response: 'False', Error: 'Movie not found!' })
      await expect(searchMovies({ query: 'xyznotreal' })).rejects.toThrow('Movie not found!')
    })

    it('throws on non-ok HTTP response', async () => {
      mockFetch({}, false)
      await expect(searchMovies({ query: 'test' })).rejects.toThrow('Network error (500)')
    })

    it('appends type param when provided', async () => {
      mockFetch({ Response: 'True', Search: [], totalResults: '0' })
      await searchMovies({ query: 'batman', type: 'movie' })
      expect(global.fetch.mock.calls[0][0]).toContain('type=movie')
    })

    it('appends year param when provided', async () => {
      mockFetch({ Response: 'True', Search: [], totalResults: '0' })
      await searchMovies({ query: 'batman', year: '2022' })
      expect(global.fetch.mock.calls[0][0]).toContain('y=2022')
    })

    it('omits type and year when not provided', async () => {
      mockFetch({ Response: 'True', Search: [], totalResults: '0' })
      await searchMovies({ query: 'test' })
      const url = global.fetch.mock.calls[0][0]
      expect(url).not.toContain('type=')
      expect(url).not.toContain('y=')
    })

    it('defaults to page 1', async () => {
      mockFetch({ Response: 'True', Search: [], totalResults: '0' })
      await searchMovies({ query: 'test' })
      expect(global.fetch.mock.calls[0][0]).toContain('page=1')
    })

    it('passes explicit page number', async () => {
      mockFetch({ Response: 'True', Search: [], totalResults: '0' })
      await searchMovies({ query: 'test', page: 3 })
      expect(global.fetch.mock.calls[0][0]).toContain('page=3')
    })
  })

  describe('getMovieDetail', () => {
    it('returns full detail on success', async () => {
      mockFetch({ Response: 'True', imdbID: 'tt1', Title: 'Inception', Genre: 'Sci-Fi' })
      const detail = await getMovieDetail('tt1')
      expect(detail.Title).toBe('Inception')
      expect(detail.Genre).toBe('Sci-Fi')
    })

    it('requests full plot', async () => {
      mockFetch({ Response: 'True', imdbID: 'tt1' })
      await getMovieDetail('tt1')
      expect(global.fetch.mock.calls[0][0]).toContain('plot=full')
    })

    it('uses imdbID param in URL', async () => {
      mockFetch({ Response: 'True', imdbID: 'tt1234567' })
      await getMovieDetail('tt1234567')
      expect(global.fetch.mock.calls[0][0]).toContain('i=tt1234567')
    })

    it('throws when Response is False', async () => {
      mockFetch({ Response: 'False', Error: 'Incorrect IMDb ID.' })
      await expect(getMovieDetail('bad-id')).rejects.toThrow('Incorrect IMDb ID.')
    })

    it('throws on network failure', async () => {
      mockFetch({}, false)
      await expect(getMovieDetail('tt1')).rejects.toThrow('Network error')
    })
  })
})
