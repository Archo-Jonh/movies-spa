import { POSTER_PLACEHOLDER } from '../utils/constants'
import { IconStar, IconStarFill } from './Icons'

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
      aria-label={`${movie.Title}, ${movie.Year}${hasRating ? `, ${movie.imdbRating} on IMDb` : ''}`}
    >
      <img
        className="card-poster"
        src={poster}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER }}
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
        aria-label={isFavorite ? `Remove ${movie.Title} from favorites` : `Add ${movie.Title} to favorites`}
      >
        {isFavorite ? <IconStarFill size={14} /> : <IconStar size={14} />}
      </button>

      <div className="card-bottom" aria-hidden="true">
        <h3 className="card-title">{movie.Title}</h3>
        <div className="card-meta">
          <span>{movie.Year}</span>
          {movie.Type && <><span>·</span><span className="card-type">{movie.Type}</span></>}
        </div>
      </div>

      {/*
        card-overlay: visible on hover only (CSS opacity + pointer-events).
        Decorative duplicate content (title, meta, genres, plot) is aria-hidden
        to avoid announcing duplicate info to screen readers; the interactive
        "More info" button stays visible in the accessibility tree.
      */}
      <div className="card-overlay">
        <p className="overlay-title" aria-hidden="true">{movie.Title}</p>
        <div className="overlay-meta" aria-hidden="true">
          <span>{movie.Year}</span>
          {hasRating && <><span>·</span><span className="overlay-rating">★ {movie.imdbRating}</span></>}
        </div>

        {movie.Genre === undefined && (
          <p className="overlay-genre-loading">Loading...</p>
        )}
        {movie.Genre && (
          <div className="overlay-genres" aria-hidden="true">
            {movie.Genre.split(',').slice(0, 3).map((g) => (
              <span key={g} className="genre-tag">{g.trim()}</span>
            ))}
          </div>
        )}

        {movie.Plot && <p className="overlay-plot" aria-hidden="true">{movie.Plot}</p>}

        <button
          className="overlay-cta"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onMoreInfo(movie) }}
        >
          More info
        </button>
      </div>
    </article>
  )
}
