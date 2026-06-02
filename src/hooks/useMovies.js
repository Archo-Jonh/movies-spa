import { useState, useCallback, useRef } from 'react'
import { searchMovies, getMovieDetail } from '../services/omdb'

export function useMovies() {
  const [movies, setMovies] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  const lastFilters = useRef(null)
  const detailCache = useRef({})
  const searchId = useRef(0)

  const fetchDetails = useCallback(async (results, sid) => {
    await Promise.allSettled(
      results
        .filter((m) => !detailCache.current[m.imdbID])
        .map(async ({ imdbID }) => {
          try {
            const d = await getMovieDetail(imdbID)
            detailCache.current[imdbID] = {
              Genre: d.Genre && d.Genre !== 'N/A' ? d.Genre : null,
              Plot: d.Plot && d.Plot !== 'N/A' ? d.Plot : null,
              imdbRating: d.imdbRating && d.imdbRating !== 'N/A' ? d.imdbRating : null,
            }
          } catch {
            detailCache.current[imdbID] = { Genre: null, Plot: null, imdbRating: null }
          }
        })
    )
    if (searchId.current !== sid) return
    setMovies((prev) =>
      prev.map((m) => {
        const cached = detailCache.current[m.imdbID]
        if (!cached) return m
        return { ...m, Genre: cached.Genre, Plot: cached.Plot, imdbRating: cached.imdbRating }
      })
    )
  }, [])

  const applyCache = (m) => {
    const cached = detailCache.current[m.imdbID]
    if (!cached) return { ...m, Genre: undefined, Plot: undefined, imdbRating: undefined }
    return { ...m, Genre: cached.Genre, Plot: cached.Plot, imdbRating: cached.imdbRating }
  }

  const search = useCallback(
    async (filters) => {
      const sid = ++searchId.current
      setLoading(true)
      setError(null)
      lastFilters.current = filters
      try {
        const data = await searchMovies({ ...filters, page: 1 })
        const results = data.Search.map(applyCache)
        setMovies(results)
        setTotal(Number(data.totalResults))
        setPage(1)
        fetchDetails(results, sid)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [fetchDetails]
  )

  const loadMore = useCallback(async () => {
    if (!lastFilters.current) return
    const sid = searchId.current
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await searchMovies({ ...lastFilters.current, page: nextPage })
      const newResults = data.Search.map(applyCache)
      if (searchId.current !== sid) return
      setMovies((prev) => [...prev, ...newResults])
      setPage(nextPage)
      fetchDetails(newResults, sid)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }, [page, fetchDetails])

  const hasMore = movies.length < total && movies.length > 0

  return { movies, total, loading, loadingMore, error, search, loadMore, hasMore }
}
