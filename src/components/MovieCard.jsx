import { POSTER_PLACEHOLDER } from '../utils/constants'

export default function MovieCard({ movie, isFavorite, onToggleFavorite, onMoreInfo, index }) {
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : POSTER_PLACEHOLDER

  return (
    <article
      className="card"
      style={{ animationDelay: `${Math.min(index, 9) * 0.055}s` }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onMoreInfo(movie)
      }}
      aria-label={`${movie.Title}, ${movie.Year}`}
    >
      <div className="card-poster-wrap">
        <img
          className="card-poster"
          src={poster}
          alt={`Poster for ${movie.Title}`}
          loading="lazy"
        />
        <button
          className={`fav-btn${isFavorite ? ' fav-btn--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(movie)
          }}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${movie.Title} from favorites`
              : `Add ${movie.Title} to favorites`
          }
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="card-body">
        <h3 className="card-title">{movie.Title}</h3>

        <div className="card-meta">
          <span className="card-year">{movie.Year}</span>
          {movie.Type && <span className="card-type">{movie.Type}</span>}
        </div>

        {movie.Genre === undefined ? (
          <div className="card-genres">
            <span className="genre-tag genre-tag--loading">Loading...</span>
          </div>
        ) : movie.Genre ? (
          <div className="card-genres">
            {movie.Genre.split(',')
              .slice(0, 3)
              .map((g) => (
                <span key={g} className="genre-tag">
                  {g.trim()}
                </span>
              ))}
          </div>
        ) : null}

        {movie.Plot && (
          <p className="card-synopsis">{movie.Plot}</p>
        )}

        <button
          className="more-info-btn"
          onClick={() => onMoreInfo(movie)}
          aria-label={`More info about ${movie.Title}`}
        >
          More info
        </button>
      </div>
    </article>
  )
}
