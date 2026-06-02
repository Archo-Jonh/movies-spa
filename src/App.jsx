import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import SearchBar from './components/SearchBar'
import MovieCard from './components/MovieCard'
import SkeletonCard from './components/SkeletonCard'
import MovieModal from './components/MovieModal'
import FavoritesSidebar from './components/FavoritesSidebar'
import { useMovies } from './hooks/useMovies'
import { useFavorites } from './hooks/useFavorites'

export default function App() {
  const { movies, total, loading, loadingMore, error, search, loadMore, hasMore } = useMovies()
  const { favorites, toggle, isFavorite, updateFavoriteData } = useFavorites()

  const [modalMovie, setModalMovie] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [genreFilter, setGenreFilter] = useState('')

  // O(1) favorite lookup for the grid
  const favoriteIdSet = useMemo(
    () => new Set(favorites.map((f) => f.imdbID)),
    [favorites]
  )

  // Genres available from currently loaded movies (populated by background fetches)
  const availableGenres = useMemo(() => {
    const set = new Set()
    movies.forEach((m) => {
      if (m.Genre) m.Genre.split(',').forEach((g) => set.add(g.trim()))
    })
    return [...set].sort()
  }, [movies])

  // Client-side genre filter applied on top of API search results
  const filteredMovies = useMemo(() => {
    if (!genreFilter) return movies
    return movies.filter((m) => m.Genre?.includes(genreFilter))
  }, [movies, genreFilter])

  // Sync Genre + Plot into favorites once background fetch resolves
  const favoritesRef = useRef(favorites)
  useEffect(() => { favoritesRef.current = favorites }, [favorites])

  useEffect(() => {
    movies.forEach((movie) => {
      if (
        (movie.Genre !== undefined || movie.Plot !== undefined) &&
        favoritesRef.current.some((f) => f.imdbID === movie.imdbID)
      ) {
        updateFavoriteData(movie.imdbID, {
          ...(movie.Genre !== undefined && { Genre: movie.Genre }),
          ...(movie.Plot !== undefined && { Plot: movie.Plot }),
        })
      }
    })
  }, [movies, updateFavoriteData])

  const handleSearch = useCallback(
    (filters) => {
      setHasSearched(true)
      setGenreFilter('')
      search(filters)
    },
    [search]
  )

  const handleOpenModal = useCallback((movie) => {
    setModalMovie(movie)
    setSidebarOpen(false)
  }, [])

  const handleCloseModal = useCallback(() => setModalMovie(null), [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand" aria-label="CineScope home">
            <span className="app-logo" aria-hidden="true">◈</span>
            <span className="app-name">CineScope</span>
          </div>
          <button
            className={`fav-toggle${favorites.length > 0 ? ' fav-toggle--has' : ''}`}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={`Favorites${favorites.length > 0 ? `, ${favorites.length} saved` : ''}`}
            aria-expanded={sidebarOpen}
            aria-controls="favorites-sidebar"
          >
            <span aria-hidden="true">★</span>
            {favorites.length > 0 && (
              <span className="fav-badge" aria-hidden="true">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="app-body">
        <main className="app-main" id="main-content" tabIndex={-1}>
          <div className="search-section">
            <h1 className="search-heading">
              Discover <em className="accent">Cinema</em>
            </h1>
            <p className="search-sub">Search millions of titles from the OMDb database.</p>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {error && (
            <div className="status-error" role="alert">
              <span aria-hidden="true">⚠</span> {error}
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">◈</div>
              <p>Enter a title above to start exploring.</p>
            </div>
          )}

          {hasSearched && !loading && movies.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">⊘</div>
              <p>No results found. Try a different search.</p>
            </div>
          )}

          {hasSearched && total > 0 && (
            <p className="results-count" aria-live="polite">
              {total.toLocaleString()} result{total !== 1 ? 's' : ''}
              {genreFilter && ` · ${filteredMovies.length} shown for "${genreFilter}"`}
            </p>
          )}

          {availableGenres.length > 0 && (
            <div className="genre-filter" role="group" aria-label="Filter results by genre">
              <span className="genre-filter-label" aria-hidden="true">Genre</span>
              <button
                className={`pill pill--sm${!genreFilter ? ' pill--active' : ''}`}
                onClick={() => setGenreFilter('')}
                aria-pressed={!genreFilter}
              >
                All
              </button>
              {availableGenres.map((g) => (
                <button
                  key={g}
                  className={`pill pill--sm${genreFilter === g ? ' pill--active' : ''}`}
                  onClick={() => setGenreFilter((prev) => (prev === g ? '' : g))}
                  aria-pressed={genreFilter === g}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          <div
            className="movies-grid"
            aria-live="polite"
            aria-label="Search results"
            aria-busy={loading}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredMovies.map((movie, index) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    index={index}
                    isFavorite={favoriteIdSet.has(movie.imdbID)}
                    onToggleFavorite={toggle}
                    onMoreInfo={handleOpenModal}
                  />
                ))}
          </div>

          {hasMore && !loading && !genreFilter && (
            <div className="load-more-wrap">
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
                aria-busy={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </main>

        <FavoritesSidebar
          favorites={favorites}
          onToggleFavorite={toggle}
          onMoreInfo={handleOpenModal}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {modalMovie && (
        <MovieModal
          movie={modalMovie}
          isFavorite={favoriteIdSet.has(modalMovie.imdbID)}
          onToggleFavorite={toggle}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
