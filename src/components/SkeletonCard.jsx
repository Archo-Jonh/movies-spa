export default function SkeletonCard() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="card-poster-wrap">
        <div className="skeleton-box" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="card-body">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--meta" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line--short" />
      </div>
    </div>
  )
}
