import type { ReactNode } from 'react'

export type Tone = 'positive' | 'negative' | 'warning'

export function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: ReactNode
  tone?: Tone
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong className={tone ? `text-${tone}` : undefined}>{value}</strong>
    </div>
  )
}
