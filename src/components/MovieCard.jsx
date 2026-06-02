import { POSTER_PLACEHOLDER } from '../utils/constants'

export default function MovieCard({ movie, isFavorite, onToggleFavorite, onMoreInfo, index }) {
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : POSTER_PLACEHOLDER
  const hasRating = movie.imdbRating && movie.imdbRating !== 'N/A'

  return (
    <article
      className="card"
      style={{ animationDelay: `${Math.min(index, 9) * 0.055}s` }}
      tabIndex={0}
      onClick={() => onMoreInfo(movie)}
      onKeyDown={(e) => { if (e.key === 'Enter') onMoreInfo(movie) }}
      aria-label={`${movie.Title}, ${movie.Year}${hasRating ? `, ${movie.imdbRating} en IMDb` : ''}`}
    >
      <img
        className="card-poster"
        src={poster}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />

      <div className="card-gradient" />

      {hasRating && (
        <div className="card-rating" aria-hidden="true">
          ★ {movie.imdbRating}
        </div>
      )}

      <button
        className={`fav-btn${isFavorite ? ' fav-btn--active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(movie) }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Quitar ${movie.Title} de favoritos` : `Agregar ${movie.Title} a favoritos`}
      >
        {isFavorite ? '★' : '☆'}
      </button>

      <div className="card-bottom" aria-hidden="true">
        <h3 className="card-title">{movie.Title}</h3>
        <div className="card-meta">
          <span>{movie.Year}</span>
          {movie.Type && <><span>·</span><span className="card-type">{movie.Type}</span></>}
        </div>
      </div>

      <div className="card-overlay" aria-hidden="true">
        <p className="overlay-title">{movie.Title}</p>
        <div className="overlay-meta">
          <span>{movie.Year}</span>
          {hasRating && <><span>·</span><span className="overlay-rating">★ {movie.imdbRating}</span></>}
        </div>
        {movie.Genre && (
          <div className="overlay-genres">
            {movie.Genre.split(',').slice(0, 3).map((g) => (
              <span key={g} className="genre-tag">{g.trim()}</span>
            ))}
          </div>
        )}
        {movie.Plot && <p className="overlay-plot">{movie.Plot}</p>}
        <button className="overlay-cta" tabIndex={-1} aria-hidden="true">
          Ver más info →
        </button>
      </div>
    </article>
  )
}
