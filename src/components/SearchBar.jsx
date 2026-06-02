import { useState } from 'react'
import { IconSearch } from './Icons'

const TYPES = [
  { value: '', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'episode', label: 'Episodes' },
]

export default function SearchBar({ onSearch, onClear, loading }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [year, setYear] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    onSearch({ query: query.trim(), type, year })
  }

  function handleQueryChange(e) {
    const val = e.target.value
    setQuery(val)
    if (val === '') onClear?.()
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search" aria-label="Search movies">
      <div className="search-main-row">
        <input
          className="search-input"
          type="search"
          placeholder="Search movies, series, episodes..."
          value={query}
          onChange={handleQueryChange}
          aria-label="Search by title"
        />
        <button
          className="search-btn"
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-label="Search"
        >
          {loading ? (
            <span className="search-spinner" aria-hidden="true" />
          ) : (
            <><IconSearch size={15} /><span>Search</span></>
          )}
        </button>
      </div>

      <div className="search-filters" role="group" aria-label="Filters">
        <div className="filter-pills">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`pill${type === t.value ? ' pill--active' : ''}`}
              onClick={() => setType(t.value)}
              aria-pressed={type === t.value}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          className="year-input"
          type="number"
          placeholder="Year"
          min="1880"
          max={new Date().getFullYear()}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Filter by year"
        />
      </div>
    </form>
  )
}
