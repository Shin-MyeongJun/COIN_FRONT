export function PremiumSparkline({ values }: { values: number[] }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 86 + 2
      const y = 28 - ((value - min) / Math.max(max - min, 0.01)) * 24
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg className="sparkline" viewBox="0 0 90 32" role="img" aria-label="프리미엄 추세 미니 차트">
      <polyline points={points} />
    </svg>
  )
}
