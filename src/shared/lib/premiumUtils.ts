export function trimmedAveragePremium(prems: number[]): number | null {
  const valid = prems.filter((p) => Number.isFinite(p))
  if (valid.length === 0) return null
  if (valid.length < 3) return valid.reduce((a, b) => a + b, 0) / valid.length
  const sorted = [...valid].sort((a, b) => a - b)
  const trimmed = sorted.slice(1, -1)
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
}
