// Local SVG wrapper — same aesthetic as Icons.jsx (1.75 stroke, round caps)
function G({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={32}
      height={32}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

// Genre-specific icons — each designed to read clearly at 32 px
const ICONS = {
  action: (
    <G>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </G>
  ),
  horror: (
    <G>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </G>
  ),
  comedy: (
    <G>
      <circle cx="12" cy="12" r="10" />
      <path d="M7 13.5s2 2.5 5 2.5 5-2.5 5-2.5" />
      <path d="M9 9h.01" strokeWidth="2.5" />
      <path d="M15 9h.01" strokeWidth="2.5" />
    </G>
  ),
  scifi: (
    <G>
      <circle cx="12" cy="12" r="4" />
      <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)" />
    </G>
  ),
  thriller: (
    <G>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </G>
  ),
  drama: (
    <G>
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </G>
  ),
  animation: (
    <G>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </G>
  ),
  anime: (
    <G>
      <line x1="7" y1="9" x2="7" y2="21" />
      <line x1="17" y1="9" x2="17" y2="21" />
      <path d="M3 6c4-2 14-2 18 0" />
      <line x1="5" y1="9" x2="19" y2="9" />
    </G>
  ),
  documentary: (
    <G>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </G>
  ),
  romance: (
    <G>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </G>
  ),
}

const GENRES = [
  { label: 'Acción',       iconKey: 'action',      query: 'action',          type: 'movie',  bg: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)' },
  { label: 'Terror',       iconKey: 'horror',      query: 'horror',          type: 'movie',  bg: 'linear-gradient(135deg, #1a0533 0%, #6c3483 100%)' },
  { label: 'Comedia',      iconKey: 'comedy',      query: 'comedy',          type: 'movie',  bg: 'linear-gradient(135deg, #d35400 0%, #f39c12 100%)' },
  { label: 'Sci-Fi',       iconKey: 'scifi',       query: 'science fiction', type: 'movie',  bg: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)' },
  { label: 'Thriller',     iconKey: 'thriller',    query: 'thriller',        type: 'movie',  bg: 'linear-gradient(135deg, #1b2631 0%, #2e4057 100%)' },
  { label: 'Drama',        iconKey: 'drama',       query: 'drama',           type: 'movie',  bg: 'linear-gradient(135deg, #512e5f 0%, #8e44ad 100%)' },
  { label: 'Animación',    iconKey: 'animation',   query: 'animation',       type: 'movie',  bg: 'linear-gradient(135deg, #1a6640 0%, #27ae60 100%)' },
  { label: 'Anime',        iconKey: 'anime',       query: 'anime',           type: 'series', bg: 'linear-gradient(135deg, #922b21 0%, #e91e63 100%)' },
  { label: 'Documentales', iconKey: 'documentary', query: 'documentary',     type: 'movie',  bg: 'linear-gradient(135deg, #0e6655 0%, #1abc9c 100%)' },
  { label: 'Romance',      iconKey: 'romance',     query: 'romance',         type: 'movie',  bg: 'linear-gradient(135deg, #7d3c98 0%, #e84393 100%)' },
]

export default function GenreGrid({ onSearch }) {
  return (
    <section className="genre-grid-section">
      <h2 className="featured-title">Explorar por género</h2>
      <div className="genre-grid">
        {GENRES.map((g) => (
          <button
            key={g.label}
            className="genre-card"
            style={{ background: g.bg }}
            onClick={() => onSearch({ query: g.query, type: g.type, year: '' })}
            aria-label={`Ver ${g.label}`}
          >
            <span className="genre-card-icon">{ICONS[g.iconKey]}</span>
            <span className="genre-card-label">{g.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
