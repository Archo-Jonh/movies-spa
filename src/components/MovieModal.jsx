import { useEffect, useRef, useState } from 'react'
import { getMovieDetail } from '../services/omdb'
import { searchTrailerVideoId } from '../services/youtube'
import { POSTER_PLACEHOLDER } from '../utils/constants'
import { IconStar, IconStarFill, IconX, IconWarning, IconPlay } from './Icons'

export default function MovieModal({ movie, isFavorite, onToggleFavorite, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [trailerId, setTrailerId] = useState(null)
  const [trailerLoading, setTrailerLoading] = useState(false)
  const [trailerError, setTrailerError] = useState(null)
  const dialogRef = useRef(null)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true)
    setError(null)
    setDetail(null)
    /* eslint-enable react-hooks/set-state-in-effect */
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
            <IconX size={16} />
          </button>
        </div>

        {loading && (
          <div className="modal-loading" aria-live="polite">
            <div className="modal-spinner" aria-label="Loading movie details" />
          </div>
        )}

        {error && !loading && (
          <div className="modal-error" role="alert">
            <IconWarning size={28} />
            <p>{error}</p>
          </div>
        )}

        {d && !loading && (
          <>
          <div className="modal-content">
            <div className="modal-poster-col">
              <img
                className="modal-poster"
                src={poster}
                alt={`Poster for ${d.Title}`}
                onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER }}
              />
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
                {isFavorite ? <><IconStarFill size={15} /> Saved</> : <><IconStar size={15} /> Save</>}
              </button>
              <button
                className={`trailer-btn${showTrailer ? ' trailer-btn--active' : ''}`}
                onClick={() => {
                  if (showTrailer) {
                    setShowTrailer(false)
                  } else {
                    setShowTrailer(true)
                    if (!trailerId && !trailerLoading) {
                      setTrailerLoading(true)
                      setTrailerError(null)
                      searchTrailerVideoId(d.Title, d.Year)
                        .then((id) => setTrailerId(id))
                        .catch((err) => setTrailerError(err.message))
                        .finally(() => setTrailerLoading(false))
                    }
                  }
                }}
                aria-expanded={showTrailer}
                aria-label={showTrailer ? 'Cerrar tráiler' : `Ver tráiler de ${d.Title}`}
              >
                {showTrailer
                  ? <><IconX size={14} /> Cerrar tráiler</>
                  : <><IconPlay size={14} /> Ver tráiler</>}
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

          {showTrailer && (
            <div className="modal-trailer">
              {trailerLoading && (
                <div className="trailer-loading" aria-live="polite">
                  <div className="modal-spinner" aria-label="Cargando tráiler" />
                </div>
              )}
              {trailerError && !trailerLoading && (
                <div className="trailer-error" role="alert">
                  <IconWarning size={18} />
                  <span>{trailerError}</span>
                </div>
              )}
              {trailerId && !trailerLoading && (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
                  title={`Tráiler de ${d.Title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}
