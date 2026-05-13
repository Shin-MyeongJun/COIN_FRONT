import { formatPercent } from '../../../shared/lib/formatPremium'
import { formatPrice } from '../../../shared/lib/formatPrice'
import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

export function PremiumBreakdownList({ pair }: { pair: PremiumPairView }) {
  return (
    <dl className="breakdown-list">
      <Breakdown label="업비트 현재가" value={formatPrice(pair.domesticCurrentPrice, pair.domesticPriceCurrency)} />
      <Breakdown label="바이낸스 선물 현재가" value={formatPrice(pair.offshoreCurrentPrice, pair.offshorePriceCurrency)} />
      <Breakdown label="매수 프리미엄" value={formatPercent(pair.buyPremiumRate)} tone="positive" />
      <Breakdown label="매도 프리미엄" value={formatPercent(pair.sellPremiumRate)} tone="positive" />
      <Breakdown label="24H 표준편차" value={`${pair.premiumStdDev24h.toFixed(2)}%`} tone="warning" />
      <Breakdown label="24H 평균" value={formatPercent(pair.premiumAverage24h)} tone="positive" />
    </dl>
  )
}

function Breakdown({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'positive' | 'negative' | 'warning'
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={tone ? `text-${tone}` : undefined}>{value}</dd>
    </div>
  )
}
