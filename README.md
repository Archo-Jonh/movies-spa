# CineScope — Movie SPA

A single-page application for searching, discovering, and saving movies and series using the [OMDb API](https://www.omdbapi.com/).

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

Copy `.env.example` to `.env` and add your free OMDb API key:

```bash
cp .env.example .env
```

Get a free key at [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).

```env
VITE_OMDB_KEY=your_api_key_here
```

### 3. Run the development server

```bash
npm run dev
```

App will be available at `http://localhost:5173`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source files with Prettier |
| `npm test` | Run tests in watch mode (Vitest) |
| `npm run test:run` | Run tests once (CI mode) |
| `npm run coverage` | Run tests and generate coverage report |

---

## Architecture

```
src/
├── components/
│   ├── SearchBar.jsx         # Search form with type/year filters
│   ├── MovieCard.jsx         # Result card with poster, genre, favorite toggle
│   ├── SkeletonCard.jsx      # Loading placeholder card
│   ├── MovieModal.jsx        # Accessible detail modal (full plot, ratings, cast)
│   └── FavoritesSidebar.jsx  # Sortable sidebar for saved movies
├── hooks/
│   ├── useMovies.js          # Search state, pagination, background genre fetching
│   └── useFavorites.js       # LocalStorage persistence for favorites
├── services/
│   └── omdb.js               # OMDb API wrapper (searchMovies, getMovieDetail)
├── App.jsx                   # Root layout: header, main, sidebar, modal
├── index.css                 # Global design system (tokens, components)
└── main.jsx                  # React entry point
```

### Main dependencies

| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| ESLint | Static analysis |
| Prettier | Code formatting |

No additional runtime libraries — pure React hooks and the browser's native `fetch` and `localStorage`.

---

## Technical decisions

**Genre fetching strategy** — OMDb's search endpoint (`s=`) does not return genre data. After each search, the app fires parallel `getMovieDetail` calls for all result IDs in the background, caching the results. Cards display a subtle "Loading..." tag while waiting and fill in automatically. A `searchId` ref prevents stale responses from previous searches from overwriting current results.

**State management** — Two custom hooks (`useMovies`, `useFavorites`) cover all state. No external store needed for this scale. The `useFavorites` hook syncs automatically to `localStorage` on every change via `useEffect`.

**Pagination** — "Load more" button appends results to the existing grid, preserving scroll position and previously loaded cards.

**Accessibility** — Modal uses `role="dialog"`, `aria-modal="true"`, focus trap (Tab/Shift-Tab cycling), and `Escape` to close. Favorite buttons use `aria-pressed`. Loading states use `aria-live` and `aria-busy`. All interactive elements have descriptive `aria-label` attributes.

**API key security** — Key is stored in a `.env` file (gitignored) and accessed via `import.meta.env.VITE_OMDB_KEY`. Never hard-coded.
