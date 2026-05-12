import { useMemo, useState } from 'react'
import { DashboardPage } from '../pages/DashboardPage'
import { EconomicTimelinePage } from '../pages/EconomicTimelinePage'
import { MarketDetailPage } from '../pages/MarketDetailPage'
import { defaultIndicatorOverlays } from '../features/chart/model/chartTypes'
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader'
import { MarketStatStrip } from '../features/dashboard/components/MarketStatStrip'
import { getMockTimelineMarkers } from '../features/economic/api/economicApi'
import { getMockCandleSeries } from '../features/market/api/marketApi'
import { getMockPremiumPairs } from '../features/premium/api/premiumApi'
import {
  defaultPremiumFilters,
  filterAndSortPremiumPairs,
  getPremiumFilterOptions,
  type PremiumFilters,
} from '../features/premium/model/premiumFilters'
import type { PremiumPairView, PremiumSortKey } from '../features/premium/model/premiumViewTypes'
import type { SortDirection } from '../shared/types/common'
import type { View } from './router'

const premiumPairs = getMockPremiumPairs()
const candleSeries = getMockCandleSeries()
const timelineMarkers = getMockTimelineMarkers()

export function App() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedPair, setSelectedPair] = useState<PremiumPairView>(premiumPairs[0])
  const [filters, setFilters] = useState<PremiumFilters>(defaultPremiumFilters)
  const [sortKey, setSortKey] = useState<PremiumSortKey>('buyPremiumRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [overlays, setOverlays] = useState(defaultIndicatorOverlays)

  const filterOptions = useMemo(() => getPremiumFilterOptions(premiumPairs), [])
  const filteredPairs = useMemo(
    () => filterAndSortPremiumPairs({ pairs: premiumPairs, filters, sortKey, sortDirection }),
    [filters, sortDirection, sortKey],
  )

  const bestPair = premiumPairs.reduce((best, pair) =>
    pair.buyPremiumRate > best.buyPremiumRate ? pair : best,
  )
  const averageBuyPremium =
    premiumPairs.reduce((sum, pair) => sum + pair.buyPremiumRate, 0) / premiumPairs.length
  const totalVolume = premiumPairs.reduce((sum, pair) => sum + pair.volume, 0)

  function updateFilter<K extends keyof PremiumFilters>(key: K, value: PremiumFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function selectPair(pair: PremiumPairView) {
    setSelectedPair(pair)
    setView('detail')
  }

  function toggleSort(nextKey: PremiumSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDirection(nextKey === 'asset' ? 'asc' : 'desc')
  }

  return (
    <div className="app-shell">
      <DashboardHeader activeView={view} onNavigate={setView} />
      <MarketStatStrip averageBuyPremium={averageBuyPremium} bestPair={bestPair} totalVolume={totalVolume} />

      {view === 'dashboard' && (
        <DashboardPage
          candles={candleSeries}
          filterOptions={filterOptions}
          filters={filters}
          pairs={filteredPairs}
          selectedPair={selectedPair}
          sortDirection={sortDirection}
          sortKey={sortKey}
          timelineMarkers={timelineMarkers}
          onFilterChange={updateFilter}
          onPairSelect={selectPair}
          onSort={toggleSort}
        />
      )}

      {view === 'detail' && (
        <MarketDetailPage
          candles={candleSeries}
          overlays={overlays}
          pair={selectedPair}
          timelineMarkers={timelineMarkers}
          onOverlayChange={setOverlays}
        />
      )}

      {view === 'timeline' && <EconomicTimelinePage markers={timelineMarkers} />}
    </div>
  )
}
