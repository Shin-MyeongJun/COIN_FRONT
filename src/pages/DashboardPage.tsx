import { CandlestickChart } from '../features/chart/components/CandlestickChart'
import type { CandlePoint } from '../features/chart/model/chartTypes'
import type { TimelineMarker } from '../features/chart/model/markerTypes'
import { StreamStatusPill } from '../features/dashboard/components/StreamStatusPill'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'
import { PremiumSummaryStrip } from '../features/market/components/PremiumSummaryStrip'
import { PremiumFilterBar } from '../features/premium/components/PremiumFilterBar'
import { PremiumTable } from '../features/premium/components/PremiumTable'
import type { PremiumFilterOptions, PremiumFilters } from '../features/premium/model/premiumFilters'
import type { PremiumPairView, PremiumSortKey } from '../features/premium/model/premiumViewTypes'
import type { SortDirection } from '../shared/types/common'

export function DashboardPage({
  candles,
  filterOptions,
  filters,
  pairs,
  selectedPair,
  sortDirection,
  sortKey,
  timelineMarkers,
  onFilterChange,
  onPairSelect,
  onSort,
}: {
  candles: CandlePoint[]
  filterOptions: PremiumFilterOptions
  filters: PremiumFilters
  pairs: PremiumPairView[]
  selectedPair: PremiumPairView
  sortDirection: SortDirection
  sortKey: PremiumSortKey
  timelineMarkers: TimelineMarker[]
  onFilterChange: <K extends keyof PremiumFilters>(key: K, value: PremiumFilters[K]) => void
  onPairSelect: (pair: PremiumPairView) => void
  onSort: (key: PremiumSortKey) => void
}) {
  return (
    <main className="dashboard-grid">
      <section className="workspace-panel main-panel" aria-label="Premium ranking dashboard">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Premium ranking</p>
            <h1>Live cross-exchange spread board</h1>
          </div>
          <StreamStatusPill />
        </div>

        <PremiumFilterBar filters={filters} options={filterOptions} onFilterChange={onFilterChange} />

        <PremiumTable
          pairs={pairs}
          sortDirection={sortDirection}
          sortKey={sortKey}
          onPairSelect={onPairSelect}
          onSort={onSort}
        />
      </section>

      <aside className="workspace-panel side-panel" aria-label="Selected chart preview">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Chart preview</p>
            <h2>{selectedPair.asset}/KRW candlestick</h2>
          </div>
          <span className="pair-pill">{selectedPair.domesticExchange} vs {selectedPair.offshoreExchange}</span>
        </div>
        <CandlestickChart compact candles={candles} markers={timelineMarkers.slice(0, 3)} />
        <PremiumSummaryStrip pair={selectedPair} />
        <EconomicTimeline markers={timelineMarkers.slice(0, 3)} compact />
      </aside>
    </main>
  )
}
