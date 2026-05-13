import { formatPercent } from '../../../shared/lib/formatPremium'
import { Stat } from '../../../shared/ui/Stat'
import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

export function PremiumSummaryStrip({ pair }: { pair: PremiumPairView }) {
  return (
    <div className="summary-strip">
      <Stat label="매수 프리미엄" value={formatPercent(pair.buyPremiumRate)} tone="positive" />
      <Stat label="매도 프리미엄" value={formatPercent(pair.sellPremiumRate)} tone="positive" />
      <Stat label="24H 표준편차" value={`${pair.premiumStdDev24h.toFixed(2)}%`} tone="warning" />
      <Stat
        label="24H 평균"
        value={formatPercent(pair.premiumAverage24h)}
        tone={pair.premiumAverage24h >= 0 ? 'positive' : 'negative'}
      />
    </div>
  )
}
