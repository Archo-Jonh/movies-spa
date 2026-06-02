import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'movie-spa:favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggle = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.imdbID === movie.imdbID)
      if (exists) return prev.filter((f) => f.imdbID !== movie.imdbID)
      return [...prev, { ...movie, addedAt: Date.now() }]
    })
  }, [])

  const isFavorite = useCallback(
    (imdbID) => favorites.some((f) => f.imdbID === imdbID),
    [favorites]
  )

  const updateFavoriteData = useCallback((imdbID, updates) => {
    setFavorites((prev) => {
      const idx = prev.findIndex((f) => f.imdbID === imdbID)
      if (idx === -1) return prev
      const existing = prev[idx]
      const hasChange = Object.entries(updates).some(([k, v]) => existing[k] !== v)
      if (!hasChange) return prev
      const next = [...prev]
      next[idx] = { ...existing, ...updates }
      return next
    })
  }, [])

  return { favorites, toggle, isFavorite, updateFavoriteData }
}
