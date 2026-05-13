export function SkeletonBox({ width = '100%', height = 20 }: { width?: string | number; height?: number }) {
  return (
    <span
      className="skeleton-box"
      style={{ width, height, display: 'block' }}
      aria-hidden="true"
    />
  )
}

export function SkeletonRow({ cols = 4, height = 38 }: { cols?: number; height?: number }) {
  return (
    <div className="skeleton-row" aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox key={i} height={height} />
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-list" aria-hidden="true" aria-label="데이터 로딩 중">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
