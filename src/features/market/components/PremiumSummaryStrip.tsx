import { formatPercent } from '../../../shared/lib/formatPremium'
import { Stat } from '../../../shared/ui/Stat'
import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

export function PremiumSummaryStrip({ pair }: { pair: PremiumPairView }) {
  return (
    <div className="summary-strip">
      <Stat label="Buy Premium" value={formatPercent(pair.buyPremiumRate)} tone="positive" />
      <Stat label="Sell Premium" value={formatPercent(pair.sellPremiumRate)} tone="positive" />
      <Stat
        label="1h change"
        value={formatPercent(pair.oneHourChangeRate)}
        tone={pair.oneHourChangeRate >= 0 ? 'positive' : 'negative'}
      />
      <Stat
        label="24h change"
        value={formatPercent(pair.twentyFourHourChangeRate)}
        tone={pair.twentyFourHourChangeRate >= 0 ? 'positive' : 'negative'}
      />
    </div>
  )
}
