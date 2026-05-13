import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertPanel } from '../features/alert/components/AlertPanel'
import { getMockTimelineMarkers } from '../features/economic/api/economicApi'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'
import { getMockPremiumPairs } from '../features/premium/api/premiumApi'
import { PremiumFilterBar } from '../features/premium/components/PremiumFilterBar'
import { PremiumTable } from '../features/premium/components/PremiumTable'
import {
  defaultPremiumFilters,
  filterAndSortPremiumPairs,
  getPremiumFilterOptions,
  type PremiumFilters,
} from '../features/premium/model/premiumFilters'
import type { PremiumPairView, PremiumSortKey } from '../features/premium/model/premiumViewTypes'
import { WatchlistPanel } from '../features/watchlist/components/WatchlistPanel'
import type { SortDirection } from '../shared/types/common'

const premiumPairs = getMockPremiumPairs()
const timelineMarkers = getMockTimelineMarkers()

export function DashboardPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PremiumFilters>(defaultPremiumFilters)
  const [sortKey, setSortKey] = useState<PremiumSortKey>('buyPremiumRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filterOptions = useMemo(() => getPremiumFilterOptions(premiumPairs), [])
  const filteredPairs = useMemo(
    () => filterAndSortPremiumPairs({ pairs: premiumPairs, filters, sortKey, sortDirection }),
    [filters, sortDirection, sortKey],
  )

  function updateFilter<K extends keyof PremiumFilters>(key: K, value: PremiumFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function toggleSort(nextKey: PremiumSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'asset' ? 'asc' : 'desc')
  }

  function selectPair(pair: PremiumPairView) {
    navigate(`/market/${pair.asset}`)
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="eyebrow">Premium Monitor</p>
          <h1>김치 프리미엄 대시보드</h1>
        </div>
      </div>

      {/* 상단 2분할: Watchlist + Alert */}
      <section className="dashboard-top-grid" aria-label="요약 패널">
        <article className="workspace-panel dash-panel watchlist-card">
          <div className="card-header">
            <div>
              <h2>📌 관심 목록</h2>
              <p>실시간 김프 모니터링</p>
            </div>
          </div>
          <WatchlistPanel />
        </article>

        <article className="workspace-panel dash-panel alert-card">
          <div className="card-header">
            <div>
              <h2>🔔 알람 발화 이력</h2>
              <p>최근 5건</p>
            </div>
            <button type="button" onClick={() => navigate('/alerts')}>전체 보기</button>
          </div>
          <AlertPanel />
        </article>
      </section>

      {/* 하단 2분할: 프리미엄 순위 + 경제 타임라인 */}
      <section className="dashboard-bottom-grid" aria-label="마켓 및 이벤트">
        <article className="workspace-panel dash-panel ranking-card-full">
          <div className="card-header">
            <div>
              <h2>🔥 프리미엄 순위</h2>
              <p>업비트 현물과 바이낸스 선물 기준</p>
            </div>
          </div>
          <div className="dashboard-filter-dock" style={{ marginBottom: 10 }}>
            <PremiumFilterBar filters={filters} options={filterOptions} onFilterChange={updateFilter} />
          </div>
          <PremiumTable
            pairs={filteredPairs}
            sortDirection={sortDirection}
            sortKey={sortKey}
            onPairSelect={selectPair}
            onSort={toggleSort}
          />
        </article>

        <article className="workspace-panel dash-panel economic-card">
          <div className="card-header">
            <div>
              <h2>📅 경제 이벤트</h2>
              <p>오늘 ± 3일 범위</p>
            </div>
            <button type="button" onClick={() => navigate('/economic')}>전체 일정</button>
          </div>
          <EconomicTimeline markers={timelineMarkers} />
        </article>
      </section>
    </main>
  )
}
