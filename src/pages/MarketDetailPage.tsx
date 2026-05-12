import { CandlestickChart } from '../features/chart/components/CandlestickChart'
import { ChartToolbar } from '../features/chart/components/ChartToolbar'
import { IndicatorOverlayControls } from '../features/chart/components/IndicatorOverlayControls'
import type { CandlePoint, IndicatorOverlayState } from '../features/chart/model/chartTypes'
import type { TimelineMarker } from '../features/chart/model/markerTypes'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'
import { MarketPairHeader } from '../features/market/components/MarketPairHeader'
import { PremiumBreakdownList } from '../features/market/components/PremiumBreakdownList'
import { PremiumSummaryStrip } from '../features/market/components/PremiumSummaryStrip'
import type { PremiumPairView } from '../features/premium/model/premiumViewTypes'

export function MarketDetailPage({
  candles,
  overlays,
  pair,
  timelineMarkers,
  onOverlayChange,
}: {
  candles: CandlePoint[]
  overlays: IndicatorOverlayState
  pair: PremiumPairView
  timelineMarkers: TimelineMarker[]
  onOverlayChange: (overlays: IndicatorOverlayState) => void
}) {
  return (
    <main className="detail-layout">
      <section className="workspace-panel">
        <MarketPairHeader pair={pair} />
        <PremiumSummaryStrip pair={pair} />
      </section>

      <section className="workspace-panel chart-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Candlestick chart</p>
            <h2>OHLC with premium and timeline overlays</h2>
          </div>
          <ChartToolbar />
        </div>
        <IndicatorOverlayControls overlays={overlays} onOverlayChange={onOverlayChange} />
        <CandlestickChart candles={candles} markers={timelineMarkers} />
      </section>

      <section className="workspace-panel two-column">
        <div>
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Recent premium</p>
              <h2>Bid/ask breakdown</h2>
            </div>
          </div>
          <PremiumBreakdownList pair={pair} />
        </div>
        <EconomicTimeline markers={timelineMarkers} />
      </section>
    </main>
  )
}
