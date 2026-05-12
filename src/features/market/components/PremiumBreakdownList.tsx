import { formatPercent } from '../../../shared/lib/formatPremium'
import { formatPrice } from '../../../shared/lib/formatPrice'
import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

export function PremiumBreakdownList({ pair }: { pair: PremiumPairView }) {
  return (
    <dl className="breakdown-list">
      <Breakdown label="Domestic bid" value={formatPrice(pair.domesticBid)} />
      <Breakdown label="Offshore ask" value={formatPrice(pair.offshoreAsk)} />
      <Breakdown label="Buy Premium" value={formatPercent(pair.buyPremiumRate)} tone="positive" />
      <Breakdown label="Domestic ask" value={formatPrice(pair.domesticAsk)} />
      <Breakdown label="Offshore bid" value={formatPrice(pair.offshoreBid)} />
      <Breakdown label="Sell Premium" value={formatPercent(pair.sellPremiumRate)} tone="positive" />
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
  tone?: 'positive' | 'negative'
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={tone ? `text-${tone}` : undefined}>{value}</dd>
    </div>
  )
}
