const KEY = import.meta.env.VITE_YOUTUBE_KEY

export async function searchTrailerVideoId(title, year) {
  if (!KEY) throw new Error('VITE_YOUTUBE_KEY no configurada')

  const q = `${title} ${year} trailer oficial`
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&key=${KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`YouTube API error (${res.status})`)
  const data = await res.json()

  const videoId = data.items?.[0]?.id?.videoId
  if (!videoId) throw new Error('No se encontró tráiler')
  return videoId
}
