import React from 'react' // eslint-disable-line no-unused-vars
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import MovieCard from '../../components/MovieCard'

const mockMovie = {
  imdbID: 'tt0816692',
  Title: 'Interstellar',
  Year: '2014',
  Type: 'movie',
  Poster: 'N/A',
  Genre: 'Adventure, Drama, Sci-Fi',
  Plot: 'A team of explorers travel through a wormhole in space.',
}

function renderCard(overrides = {}, props = {}) {
  return render(
    <MovieCard
      movie={{ ...mockMovie, ...overrides }}
      index={0}
      isFavorite={false}
      onToggleFavorite={vi.fn()}
      onMoreInfo={vi.fn()}
      {...props}
    />
  )
}

describe('MovieCard', () => {
  it('renders title and year', () => {
    renderCard()
    expect(screen.getByText('Interstellar')).toBeInTheDocument()
    expect(screen.getByText('2014')).toBeInTheDocument()
  })

  it('renders genre tags split by comma', () => {
    renderCard()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
  })

  it('renders the synopsis when Plot is present', () => {
    renderCard()
    expect(screen.getByText(mockMovie.Plot)).toBeInTheDocument()
  })

  it('does not render synopsis when Plot is null', () => {
    renderCard({ Plot: null })
    expect(screen.queryByText(/wormhole/)).not.toBeInTheDocument()
  })

  it('shows "Loading..." when Genre is undefined', () => {
    renderCard({ Genre: undefined })
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows no genre section when Genre is null', () => {
    renderCard({ Genre: null })
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('shows a "More info" button', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /more info/i })).toBeInTheDocument()
  })

  it('calls onMoreInfo with the movie when "More info" is clicked', async () => {
    const onMoreInfo = vi.fn()
    renderCard({}, { onMoreInfo })
    await userEvent.click(screen.getByRole('button', { name: /more info/i }))
    expect(onMoreInfo).toHaveBeenCalledWith(expect.objectContaining({ imdbID: 'tt0816692' }))
  })

  it('calls onMoreInfo when Enter is pressed on the card', async () => {
    const onMoreInfo = vi.fn()
    renderCard({}, { onMoreInfo })
    screen.getByRole('article').focus()
    await userEvent.keyboard('{Enter}')
    expect(onMoreInfo).toHaveBeenCalled()
  })

  it('shows add-to-favorites button when not favorite', () => {
    renderCard({}, { isFavorite: false })
    expect(screen.getByRole('button', { name: /add.*favorites/i })).toBeInTheDocument()
  })

  it('shows remove-from-favorites button when already favorite', () => {
    renderCard({}, { isFavorite: true })
    expect(screen.getByRole('button', { name: /remove.*favorites/i })).toBeInTheDocument()
  })

  it('calls onToggleFavorite with the movie when fav button is clicked', async () => {
    const onToggleFavorite = vi.fn()
    renderCard({}, { onToggleFavorite })
    await userEvent.click(screen.getByRole('button', { name: /add.*favorites/i }))
    expect(onToggleFavorite).toHaveBeenCalledWith(expect.objectContaining({ imdbID: 'tt0816692' }))
  })

  it('uses a placeholder when Poster is N/A', () => {
    renderCard({ Poster: 'N/A' })
    const img = screen.getByRole('img')
    expect(img.src).toContain('data:image/svg+xml')
  })

  it('uses the real poster URL when available', () => {
    renderCard({ Poster: 'https://example.com/poster.jpg' })
    const img = screen.getByRole('img')
    expect(img.src).toBe('https://example.com/poster.jpg')
  })
})
