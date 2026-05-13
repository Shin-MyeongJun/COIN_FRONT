import { formatPercent } from '../../../shared/lib/formatPremium'

export function PremiumMetricCell({ value, side }: { value: number; side: 'Buy' | 'Sell' }) {
  return (
    <span className="premium-metric">
      <span>{side === 'Buy' ? '매수' : '매도'}</span>
      <strong>{formatPercent(value)}</strong>
    </span>
  )
}
