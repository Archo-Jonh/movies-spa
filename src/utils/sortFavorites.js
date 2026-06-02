export function sortFavorites(favorites, sort) {
  const arr = [...favorites]
  switch (sort) {
    case 'az':
      return arr.sort((a, b) => a.Title.localeCompare(b.Title))
    case 'genre':
      return arr.sort((a, b) => {
        const ga = a.Genre?.split(',')[0]?.trim() ?? 'zzz'
        const gb = b.Genre?.split(',')[0]?.trim() ?? 'zzz'
        return ga.localeCompare(gb)
      })
    case 'date':
    default:
      return arr.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))
  }
}
