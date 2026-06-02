import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import SearchBar from './components/SearchBar'
import MovieCard from './components/MovieCard'
import SkeletonCard from './components/SkeletonCard'
import MovieModal from './components/MovieModal'
import FavoritesSidebar from './components/FavoritesSidebar'
import FeaturedSection from './components/FeaturedSection'
import GenreGrid from './components/GenreGrid'
import { IconDiamond, IconStar, IconStarFill, IconWarning, IconSearchX, IconFlame, IconTv, IconClapperboard } from './components/Icons'
import { useMovies } from './hooks/useMovies'
import { useFavorites } from './hooks/useFavorites'

const SUGGESTIONS = ['Marvel', 'Star Wars', 'Batman', 'Harry Potter', 'Interstellar', 'Fast & Furious']

export default function App() {
  const { movies, total, loading, loadingMore, error, search, loadMore, hasMore } = useMovies()
  const { favorites, toggle, isFavorite, updateFavoriteData } = useFavorites()

  const [modalMovie, setModalMovie] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [genreFilter, setGenreFilter] = useState('')

  const favoriteIdSet = useMemo(
    () => new Set(favorites.map((f) => f.imdbID)),
    [favorites]
  )

  const availableGenres = useMemo(() => {
    const set = new Set()
    movies.forEach((m) => {
      if (m.Genre) m.Genre.split(',').forEach((g) => set.add(g.trim()))
    })
    return [...set].sort()
  }, [movies])

  const filteredMovies = useMemo(() => {
    if (!genreFilter) return movies
    return movies.filter((m) => m.Genre?.includes(genreFilter))
  }, [movies, genreFilter])

  const favoritesRef = useRef(favorites)
  useEffect(() => { favoritesRef.current = favorites }, [favorites])

  useEffect(() => {
    movies.forEach((movie) => {
      if (
        (movie.Genre !== undefined || movie.Plot !== undefined || movie.imdbRating !== undefined) &&
        favoritesRef.current.some((f) => f.imdbID === movie.imdbID)
      ) {
        updateFavoriteData(movie.imdbID, {
          ...(movie.Genre !== undefined && { Genre: movie.Genre }),
          ...(movie.Plot !== undefined && { Plot: movie.Plot }),
          ...(movie.imdbRating !== undefined && { imdbRating: movie.imdbRating }),
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
          <div className="app-brand" aria-label="Lux">
            <span className="app-logo" aria-hidden="true"><IconDiamond size={22} /></span>
            <span className="app-name">Lux</span>
          </div>
          <button
            className={`fav-toggle${favorites.length > 0 ? ' fav-toggle--has' : ''}`}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={`Favoritos${favorites.length > 0 ? `, ${favorites.length} guardados` : ''}`}
            aria-expanded={sidebarOpen}
            aria-controls="favorites-sidebar"
          >
            {favorites.length > 0 ? <IconStarFill size={18} /> : <IconStar size={18} />}
            {favorites.length > 0 && (
              <span className="fav-badge" aria-hidden="true">{favorites.length}</span>
            )}
          </button>
        </div>
      </header>

      <div className="app-body">
        <main className="app-main" id="main-content" tabIndex={-1}>
          <div className="search-section">
            <h1 className="search-heading">
              El Cine <em className="accent">Sin Límites</em>
            </h1>
            <p className="search-sub">Busca entre millones de películas y series. Guarda las que no quieres olvidar.</p>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {error && (
            <div className="status-error" role="alert">
              <IconWarning size={16} /> {error}
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="home-state">
              <div className="suggestions-row" role="group" aria-label="Búsquedas sugeridas">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="suggestion-pill"
                    onClick={() => handleSearch({ query: s, type: '', year: '' })}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <GenreGrid onSearch={handleSearch} />

              <FeaturedSection
                title="Tendencias"
                icon={<IconFlame size={20} />}
                query="marvel"
                favoriteIdSet={favoriteIdSet}
                onToggleFavorite={toggle}
                onMoreInfo={handleOpenModal}
              />
              <FeaturedSection
                title="Series populares"
                icon={<IconTv size={20} />}
                query="breaking"
                type="series"
                favoriteIdSet={favoriteIdSet}
                onToggleFavorite={toggle}
                onMoreInfo={handleOpenModal}
              />
              <FeaturedSection
                title="Estrenos"
                icon={<IconClapperboard size={20} />}
                query="movie"
                type="movie"
                year={new Date().getFullYear().toString()}
                favoriteIdSet={favoriteIdSet}
                onToggleFavorite={toggle}
                onMoreInfo={handleOpenModal}
              />
            </div>
          )}

          {hasSearched && !loading && movies.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true"><IconSearchX size={48} /></div>
              <p>Sin resultados. Intenta con otro término.</p>
            </div>
          )}

          {hasSearched && total > 0 && (
            <p className="results-count" aria-live="polite">
              {total.toLocaleString()} resultado{total !== 1 ? 's' : ''}
              {genreFilter && ` · ${filteredMovies.length} con "${genreFilter}"`}
            </p>
          )}

          {availableGenres.length > 0 && (
            <div className="genre-filter" role="group" aria-label="Filtrar por género">
              <span className="genre-filter-label" aria-hidden="true">Género</span>
              <button
                className={`pill pill--sm${!genreFilter ? ' pill--active' : ''}`}
                onClick={() => setGenreFilter('')}
                aria-pressed={!genreFilter}
              >
                Todos
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
            aria-label="Resultados de búsqueda"
            aria-busy={loading}
          >
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
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
                {loadingMore ? 'Cargando...' : 'Cargar más'}
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
