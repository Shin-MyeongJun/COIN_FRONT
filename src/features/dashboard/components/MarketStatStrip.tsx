import { formatPercent } from '../../../shared/lib/formatPremium'
import { formatVolume } from '../../../shared/lib/formatNumber'
import { Stat } from '../../../shared/ui/Stat'
import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

export function MarketStatStrip({
  averageBuyPremium,
  bestPair,
  totalVolume,
}: {
  averageBuyPremium: number
  bestPair: PremiumPairView
  totalVolume: number
}) {
  return (
    <section className="stat-strip" aria-label="Market summary">
      <Stat label="Average buy premium" value={formatPercent(averageBuyPremium)} tone="positive" />
      <Stat label="Highest premium" value={`${bestPair.asset} ${formatPercent(bestPair.buyPremiumRate)}`} tone="positive" />
      <Stat label="Compared volume" value={`KRW ${formatVolume(totalVolume)}`} />
      <Stat label="Stream" value="Connected" tone="positive" />
      <Stat label="Last event" value="12s ago" />
    </section>
  )
}
