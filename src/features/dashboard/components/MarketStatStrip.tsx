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
    <section className="stat-strip" aria-label="시장 요약">
      <Stat label="평균 매수 프리미엄" value={formatPercent(averageBuyPremium)} tone="positive" />
      <Stat label="최고 프리미엄" value={`${bestPair.asset} ${formatPercent(bestPair.buyPremiumRate)}`} tone="positive" />
      <Stat label="24H 거래량 합계" value={`KRW ${formatVolume(totalVolume)}`} />
      <Stat label="스트림" value="연결됨" tone="positive" />
      <Stat label="최근 이벤트" value="12초 전" />
    </section>
  )
}
