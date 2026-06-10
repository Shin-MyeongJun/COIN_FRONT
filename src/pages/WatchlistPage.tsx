import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMockPremiumPairs } from '../features/premium/api/premiumApi'
import { PremiumSparkline } from '../features/premium/components/PremiumSparkline'
import {
  useAddWatchlistMutation,
  useRemoveWatchlistMutation,
  useWatchlistQuery,
} from '../features/watchlist/api/useWatchlistQueries'
import type { WatchlistItemDto } from '../features/watchlist/api/watchlistTypes'
import { ProblemDetailAlert } from '../shared/ui/ProblemDetailAlert'
import { formatPercent } from '../shared/lib/formatPremium'
import { formatPrice } from '../shared/lib/formatPrice'

// Premium-pairs catalog is still mocked at the M3 layer — used here only as
// a lookup table for price / sparkline display next to each watchlist row,
// and as the source of "addable" candidates in the search panel.
const ALL_PAIRS = getMockPremiumPairs()

export function WatchlistPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const listQuery = useWatchlistQuery()
  const addMutation = useAddWatchlistMutation()
  const removeMutation = useRemoveWatchlistMutation()

  const items: WatchlistItemDto[] = listQuery.data?.items ?? []
  const watchedAssets = new Set(items.map((i) => i.asset))

  const watchedPairs = items.map((item) => {
    const pair = ALL_PAIRS.find((p) => p.asset === item.asset)
    return { item, pair }
  })

  const availableToAdd = ALL_PAIRS.filter(
    (p) =>
      !watchedAssets.has(p.asset) &&
      (p.asset.toLowerCase().includes(search.toLowerCase()) ||
        p.assetName.toLowerCase().includes(search.toLowerCase())),
  )

  function handleAdd(asset: string) {
    addMutation.mutate(
      { asset },
      {
        onSuccess: () => setSearch(''),
      },
    )
  }

  function handleRemove(id: number) {
    removeMutation.mutate({ id })
  }

  const total = listQuery.data?.total ?? items.length
  const isInitialLoading = listQuery.isPending

  return (
    <main className="page-content watchlist-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h1>관심 목록</h1>
          <p className="page-desc">
            {isInitialLoading ? '불러오는 중…' : `총 ${total}개 자산 추적 중`}
          </p>
        </div>
      </div>

      <ProblemDetailAlert error={listQuery.error} />
      <ProblemDetailAlert
        error={addMutation.error}
        onDismiss={() => addMutation.reset()}
      />
      <ProblemDetailAlert
        error={removeMutation.error}
        onDismiss={() => removeMutation.reset()}
      />

      <section className="workspace-panel watchlist-main-panel">
        <h2>내 관심 목록</h2>

        {isInitialLoading && (
          <p className="muted-center" style={{ padding: '24px 0' }}>불러오는 중…</p>
        )}

        {!isInitialLoading && watchedPairs.length === 0 && (
          <p className="muted-center" style={{ padding: '24px 0' }}>관심 목록이 비어 있습니다.</p>
        )}

        <div className="watchlist-manage-list">
          {watchedPairs.map(({ item, pair }) => (
            <div key={item.id} className="watchlist-manage-row">
              <button
                type="button"
                className="wl-row-info"
                onClick={() => navigate(`/market/${item.asset}`)}
              >
                <span className="coin-symbol-badge wl-badge">{item.asset.slice(0, 1)}</span>
                <span className="wl-info">
                  <strong>{item.asset}</strong>
                  <small>{item.assetName ?? pair?.assetName ?? item.asset}</small>
                </span>
                <span className="wl-price">
                  {pair !== undefined ? (
                    <>
                      <strong>{formatPrice(pair.domesticCurrentPrice, 'KRW')}</strong>
                      <small className={pair.buyPremiumRate >= 0 ? 'text-positive' : 'text-negative'}>
                        김프 {formatPercent(pair.buyPremiumRate)}
                      </small>
                    </>
                  ) : (
                    <small className="muted">시세 정보 없음</small>
                  )}
                </span>
                <span className="wl-sparkline">
                  {pair !== undefined && <PremiumSparkline values={pair.sparkline} />}
                </span>
              </button>
              <button
                type="button"
                className="btn-sm btn-danger wl-remove"
                onClick={() => handleRemove(item.id)}
                disabled={removeMutation.isPending}
                aria-label={`${item.asset} 관심 목록에서 제거`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="workspace-panel watchlist-add-panel">
        <h2>자산 추가</h2>
        <div className="wl-search-row">
          <input
            type="search"
            placeholder="코인 검색 (예: BTC, 이더리움)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="wl-add-grid">
          {availableToAdd.slice(0, 12).map((pair) => (
            <button
              key={pair.asset}
              type="button"
              className="wl-add-chip"
              onClick={() => handleAdd(pair.asset)}
              disabled={addMutation.isPending}
            >
              <span className="coin-symbol-badge wl-badge sm">{pair.asset.slice(0, 1)}</span>
              <span>
                <strong>{pair.asset}</strong>
                <small>{pair.assetName}</small>
              </span>
              <span className={pair.buyPremiumRate >= 0 ? 'text-positive wl-prem' : 'text-negative wl-prem'}>
                {formatPercent(pair.buyPremiumRate)}
              </span>
              <span className="wl-add-btn" aria-hidden="true">+</span>
            </button>
          ))}
          {availableToAdd.length === 0 && <p className="muted-center">추가할 자산이 없습니다.</p>}
        </div>
      </section>
    </main>
  )
}
