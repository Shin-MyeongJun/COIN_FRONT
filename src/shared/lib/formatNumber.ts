export function formatVolume(value: number) {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(0)}B`
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`
  }

  return value.toLocaleString('en-US')
}
