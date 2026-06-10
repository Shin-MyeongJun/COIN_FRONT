import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StreamStatusPill } from '../features/dashboard/components/StreamStatusPill'
import { WatchlistAlertPanel } from '../features/dashboard/components/WatchlistAlertPanel'
import { NewsPanel } from '../features/news/components/NewsPanel'
import { usePremiumRankingQuery } from '../features/premium/api/usePremiumQueries'
import { PremiumFilterBar } from '../features/premium/components/PremiumFilterBar'
import { PremiumTable } from '../features/premium/components/PremiumTable'
import {
  defaultPremiumFilters,
  filterAndSortPremiumPairs,
  getPremiumFilterOptions,
  type PremiumFilters,
} from '../features/premium/model/premiumFilters'
import { usePremiumLive } from '../features/premium/model/usePremiumLive'
import type { PremiumPairView, PremiumSortKey } from '../features/premium/model/premiumViewTypes'
import type { SortDirection } from '../shared/types/common'
import { EmptyState } from '../shared/ui/EmptyState'
import { ErrorState } from '../shared/ui/ErrorState'
import { SkeletonList } from '../shared/ui/SkeletonLoader'

const RANKING_LIMIT = 20

export function DashboardPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PremiumFilters>(defaultPremiumFilters)
  const [sortKey, setSortKey] = useState<PremiumSortKey>('buyPremiumRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const premiumQuery = usePremiumRankingQuery(RANKING_LIMIT)
  const premiumPairs = useMemo<PremiumPairView[]>(
    () => premiumQuery.data ?? [],
    [premiumQuery.data],
  )

  // 라이브 갱신: mock 모드면 2초 시뮬레이션, real 모드면 premium SSE 머지.
  const { pairs: livePairs, changedKeys } = usePremiumLive(premiumPairs)

  const filterOptions = useMemo(() => getPremiumFilterOptions(livePairs), [livePairs])
  const filteredPairs = useMemo(
    () => filterAndSortPremiumPairs({ pairs: livePairs, filters, sortKey, sortDirection }),
    [filters, sortDirection, sortKey, livePairs],
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
        <StreamStatusPill />
      </div>

      {/* NOTE: 좌측 풀하이트 = 프리미엄 / 우상 = 관심+알람 / 우하 = 뉴스 */}
      <section className="dashboard-mosaic-v2" aria-label="대시보드 패널">
        <article className="workspace-panel dash-panel ranking-card-full dashboard-mosaic-left">
          <div className="card-header">
            <div>
              <h2>🔥 프리미엄 순위</h2>
              <p>업비트 현물과 바이낸스 선물 기준</p>
            </div>
          </div>
          <div className="dashboard-filter-dock" style={{ marginBottom: 10 }}>
            <PremiumFilterBar filters={filters} options={filterOptions} onFilterChange={updateFilter} />
          </div>
          <PremiumRankingSection
            isLoading={premiumQuery.isPending}
            isError={premiumQuery.isError}
            errorMessage={premiumQuery.error?.title}
            pairs={filteredPairs}
            changedKeys={changedKeys}
            sortDirection={sortDirection}
            sortKey={sortKey}
            onPairSelect={selectPair}
            onSort={toggleSort}
          />
        </article>

        <article className="workspace-panel dash-panel dashboard-mosaic-top-right">
          <WatchlistAlertPanel />
        </article>

        <article className="workspace-panel dash-panel news-card dashboard-mosaic-bottom-right">
          <div className="card-header">
            <div>
              <h2>📰 뉴스</h2>
              <p>최신 시장 헤드라인</p>
            </div>
            {/* NOTE: 전용 라우트 미정. 라우트 추가 시 disabled 해제 + onClick 연결. */}
            <button type="button" disabled aria-disabled="true" title="준비 중">
              전체 보기
            </button>
          </div>
          <NewsPanel />
        </article>
      </section>
    </main>
  )
}

function PremiumRankingSection({
  isLoading,
  isError,
  errorMessage,
  pairs,
  changedKeys,
  sortDirection,
  sortKey,
  onPairSelect,
  onSort,
}: {
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  pairs: PremiumPairView[]
  changedKeys: ReadonlySet<string>
  sortDirection: SortDirection
  sortKey: PremiumSortKey
  onPairSelect: (pair: PremiumPairView) => void
  onSort: (key: PremiumSortKey) => void
}) {
  if (isLoading) {
    return <SkeletonList rows={6} />
  }
  if (isError) {
    return <ErrorState message={errorMessage ?? '프리미엄 순위를 불러오지 못했습니다.'} />
  }
  if (pairs.length === 0) {
    return (
      <EmptyState
        title="표시할 프리미엄 페어가 없습니다."
        message="필터 조건을 완화하거나 잠시 후 다시 시도해 주세요."
      />
    )
  }
  return (
    <PremiumTable
      pairs={pairs}
      changedKeys={changedKeys}
      sortDirection={sortDirection}
      sortKey={sortKey}
      onPairSelect={onPairSelect}
      onSort={onSort}
    />
  )
}
