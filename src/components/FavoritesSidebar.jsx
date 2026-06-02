import { useState } from 'react'
import { sortFavorites } from '../utils/sortFavorites'
import { IconStar, IconStarFill, IconX } from './Icons'

const SORT_OPTIONS = [
  { value: 'date', label: 'Date added' },
  { value: 'az', label: 'A–Z' },
  { value: 'genre', label: 'Genre' },
]

const THUMB_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="72"><rect width="48" height="72" fill="#101022"/></svg>'
)}`

export default function FavoritesSidebar({
  favorites,
  onToggleFavorite,
  onMoreInfo,
  isOpen,
  onClose,
}) {
  const [sort, setSort] = useState('date')
  const sorted = sortFavorites(favorites, sort)

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
        id="favorites-sidebar"
        aria-label="Favorites"
        aria-hidden={!isOpen ? 'true' : undefined}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <IconStarFill size={16} /> Favorites
            {favorites.length > 0 && (
              <span className="sidebar-count" aria-label={`${favorites.length} saved`}>
                {favorites.length}
              </span>
            )}
          </h2>
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close favorites panel"
          >
            <IconX size={14} />
          </button>
        </div>

        {favorites.length > 0 && (
          <div className="sidebar-sort" role="group" aria-label="Sort favorites by">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`pill pill--sm${sort === o.value ? ' pill--active' : ''}`}
                onClick={() => setSort(o.value)}
                aria-pressed={sort === o.value}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="sidebar-empty">
            <span className="sidebar-empty-icon" aria-hidden="true">
              <IconStar size={36} />
            </span>
            <p>
              No favorites yet.
              <br />
              Tap the star on any title to save it here.
            </p>
          </div>
        ) : (
          <ul className="fav-list" role="list" aria-label="Saved movies">
            {sorted.map((movie) => (
              <li key={movie.imdbID} className="fav-item">
                <button
                  className="fav-item-inner"
                  onClick={() => onMoreInfo(movie)}
                  aria-label={`View details for ${movie.Title}`}
                >
                  <img
                    className="fav-poster"
                    src={
                      movie.Poster && movie.Poster !== 'N/A'
                        ? movie.Poster
                        : THUMB_PLACEHOLDER
                    }
                    alt=""
                    aria-hidden="true"
                    width={48}
                    height={72}
                    onError={(e) => { e.currentTarget.src = THUMB_PLACEHOLDER }}
                  />
                  <div className="fav-info">
                    <span className="fav-title">{movie.Title}</span>
                    <span className="fav-meta">{movie.Year}</span>
                    {movie.Genre && (
                      <span className="fav-genre">{movie.Genre.split(',')[0].trim()}</span>
                    )}
                  </div>
                </button>
                <button
                  className="fav-remove"
                  onClick={() => onToggleFavorite(movie)}
                  aria-label={`Remove ${movie.Title} from favorites`}
                >
                  <IconX size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  )
}
