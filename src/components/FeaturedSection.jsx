import { useEffect, useState } from 'react'
import { searchMovies, getMovieDetail } from '../services/omdb'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

export default function FeaturedSection({ title, icon, query, type = '', year = '', favoriteIdSet, onToggleFavorite, onMoreInfo }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFailed(false)

    searchMovies({ query, type, year, page: 1 })
      .then((data) => {
        if (cancelled || !data.Search) return

        // Genre/Plot start as null (not undefined) so the overlay never shows "Loading..."
        const results = data.Search.slice(0, 6).map((m) => ({ ...m, Genre: null, Plot: null }))
        setMovies(results)

        // Fetch full detail for the first 4 cards in the background.
        // Limited to 4 to stay within free-tier API request budgets.
        results.slice(0, 4).forEach((movie) => {
          getMovieDetail(movie.imdbID)
            .then((detail) => {
              if (cancelled) return
              setMovies((prev) =>
                prev.map((m) =>
                  m.imdbID === movie.imdbID
                    ? {
                        ...m,
                        Genre:      detail.Genre      && detail.Genre      !== 'N/A' ? detail.Genre      : null,
                        Plot:       detail.Plot       && detail.Plot       !== 'N/A' ? detail.Plot       : null,
                        imdbRating: detail.imdbRating && detail.imdbRating !== 'N/A' ? detail.imdbRating : null,
                      }
                    : m
                )
              )
            })
            .catch(() => {})
        })
      })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [query, type, year])

  if (failed) return null

  return (
    <section className="featured-section">
      <h2 className="featured-title">
        {icon && <span className="featured-title-icon">{icon}</span>}
        {title}
      </h2>
      <div className="featured-scroll">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="featured-card-wrap">
                <SkeletonCard />
              </div>
            ))
          : movies.map((movie, index) => (
              <div key={movie.imdbID} className="featured-card-wrap">
                <MovieCard
                  movie={movie}
                  index={index}
                  isFavorite={favoriteIdSet.has(movie.imdbID)}
                  onToggleFavorite={onToggleFavorite}
                  onMoreInfo={onMoreInfo}
                />
              </div>
            ))}
      </div>
    </section>
  )
}
