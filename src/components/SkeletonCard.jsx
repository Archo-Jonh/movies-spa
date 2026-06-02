export default function SkeletonCard() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="skeleton-box" style={{ position: 'absolute', inset: 0 }} />
      <div className="card-gradient" />
      <div className="card-bottom">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--meta" />
      </div>
    </div>
  )
}
