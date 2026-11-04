export function PropertySkeleton() {
  return (
    <div className="card card-lg" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 0 }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 18, width: '42%' }} />
        <div className="skeleton" style={{ height: 22, width: '82%' }} />
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
        <div className="skeleton" style={{ height: 40, width: '100%', marginBlockStart: 6 }} />
      </div>
    </div>
  )
}

export function PropertyGridSkeleton({ count = 6 }) {
  return (
    <div className="property-grid">
      {Array.from({ length: count }).map((_, i) => (
        <PropertySkeleton key={i} />
      ))}
    </div>
  )
}

export function RowSkeleton({ rows = 5 }) {
  return (
    <div className="stack gap-12">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
      ))}
    </div>
  )
}
