import { useEffect, useRef, useState } from 'react'
import { getMovieDetail } from '../services/omdb'
import { POSTER_PLACEHOLDER } from '../utils/constants'

export default function MovieModal({ movie, isFavorite, onToggleFavorite, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dialogRef = useRef(null)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)
    getMovieDetail(movie.imdbID)
      .then((data) => { if (!cancelled) setDetail(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [movie.imdbID])

  useEffect(() => {
    const prevFocus = document.activeElement
    closeBtnRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = [
          ...dialogRef.current.querySelectorAll(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ),
        ]
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      prevFocus?.focus()
    }
  }, [onClose])

  const d = detail
  const poster = d?.Poster && d.Poster !== 'N/A' ? d.Poster : POSTER_PLACEHOLDER

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={d ? 'modal-plot' : undefined}
        aria-busy={loading}
      >
        <div className="modal-topbar">
          <button
            ref={closeBtnRef}
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="modal-loading" aria-live="polite">
            <div className="modal-spinner" aria-label="Loading movie details" />
          </div>
        )}

        {error && !loading && (
          <div className="modal-error" role="alert">
            <span>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {d && !loading && (
          <div className="modal-content">
            <div className="modal-poster-col">
              <img className="modal-poster" src={poster} alt={`Poster for ${d.Title}`} />
              <button
                className={`fav-btn fav-btn--lg${isFavorite ? ' fav-btn--active' : ''}`}
                onClick={() => onToggleFavorite(d)}
                aria-pressed={isFavorite}
                aria-label={
                  isFavorite
                    ? `Remove ${d.Title} from favorites`
                    : `Add ${d.Title} to favorites`
                }
              >
                {isFavorite ? '★ Saved' : '☆ Save'}
              </button>
            </div>

            <div className="modal-info">
              <div className="modal-badges">
                {d.Rated && d.Rated !== 'N/A' && <span className="badge">{d.Rated}</span>}
                {d.Runtime && d.Runtime !== 'N/A' && <span className="badge">{d.Runtime}</span>}
                {d.Year && <span className="badge">{d.Year}</span>}
              </div>

              <h2 id="modal-title" className="modal-title">
                {d.Title}
              </h2>

              {d.Genre && d.Genre !== 'N/A' && (
                <div className="modal-genres">
                  {d.Genre.split(',').map((g) => (
                    <span key={g} className="genre-tag">
                      {g.trim()}
                    </span>
                  ))}
                </div>
              )}

              {d.Plot && d.Plot !== 'N/A' && (
                <p id="modal-plot" className="modal-plot">
                  {d.Plot}
                </p>
              )}

              <div className="modal-details">
                {[
                  { label: 'Director', value: d.Director },
                  { label: 'Cast', value: d.Actors },
                  { label: 'Writer', value: d.Writer },
                  { label: 'Language', value: d.Language },
                  { label: 'Country', value: d.Country },
                  { label: 'Awards', value: d.Awards },
                ]
                  .filter(({ value }) => value && value !== 'N/A')
                  .map(({ label, value }) => (
                    <div key={label} className="detail-row">
                      <span className="detail-label">{label}</span>
                      <span className="detail-value">{value}</span>
                    </div>
                  ))}
              </div>

              {d.Ratings && d.Ratings.length > 0 && (
                <div className="modal-ratings" aria-label="Ratings">
                  {d.Ratings.map((r) => (
                    <div key={r.Source} className="rating-item">
                      <span className="rating-source">{r.Source}</span>
                      <span className="rating-value">{r.Value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
