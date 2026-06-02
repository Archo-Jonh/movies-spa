const BASE = 'https://www.omdbapi.com'
const KEY = import.meta.env.VITE_OMDB_KEY

if (!KEY) {
  console.warn('[omdb] VITE_OMDB_KEY not set — create a .env file based on .env.example')
}

function buildUrl(params) {
  return `${BASE}/?${new URLSearchParams({ apikey: KEY, ...params })}`
}

export async function searchMovies({ query, type, year, page = 1 }) {
  const params = { s: query, page }
  if (type) params.type = type
  if (year) params.y = year

  const res = await fetch(buildUrl(params))
  if (!res.ok) throw new Error(`Network error (${res.status})`)
  const data = await res.json()
  if (data.Response === 'False') throw new Error(data.Error)
  return data
}

export async function getMovieDetail(imdbID) {
  const res = await fetch(buildUrl({ i: imdbID, plot: 'full' }))
  if (!res.ok) throw new Error(`Network error (${res.status})`)
  const data = await res.json()
  if (data.Response === 'False') throw new Error(data.Error)
  return data
}
