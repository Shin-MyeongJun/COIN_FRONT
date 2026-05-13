import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMockPremiumPairs } from '../features/premium/api/premiumApi'
import { PremiumSparkline } from '../features/premium/components/PremiumSparkline'
import { formatPercent } from '../shared/lib/formatPremium'
import { formatPrice } from '../shared/lib/formatPrice'

const ALL_PAIRS = getMockPremiumPairs()
const DEFAULT_WATCHLIST = ['BTC', 'ETH', 'XRP', 'SOL']

export function WatchlistPage() {
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST)
  const [search, setSearch] = useState('')

  const watchedPairs = watchlist
    .map((a) => ALL_PAIRS.find((p) => p.asset === a))
    .filter(Boolean)

  const availableToAdd = ALL_PAIRS.filter(
    (p) => !watchlist.includes(p.asset) &&
      (p.asset.toLowerCase().includes(search.toLowerCase()) || p.assetName.toLowerCase().includes(search.toLowerCase()))
  )

  function remove(asset: string) {
    setWatchlist((prev) => prev.filter((a) => a !== asset))
  }

  function add(asset: string) {
    setWatchlist((prev) => [...prev, asset])
    setSearch('')
  }

  return (
    <main className="page-content watchlist-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h1>관심 목록</h1>
          <p className="page-desc">총 {watchlist.length}개 자산 추적 중</p>
        </div>
      </div>

      <section className="workspace-panel watchlist-main-panel">
        <h2>내 관심 목록</h2>
        {watchedPairs.length === 0 && (
          <p className="muted-center" style={{ padding: '24px 0' }}>관심 목록이 비어 있습니다.</p>
        )}
        <div className="watchlist-manage-list">
          {watchedPairs.map((pair) => {
            if (!pair) return null
            return (
              <div key={pair.asset} className="watchlist-manage-row">
                <button
                  type="button"
                  className="wl-row-info"
                  onClick={() => navigate(`/market/${pair.asset}`)}
                >
                  <span className="coin-symbol-badge wl-badge">{pair.asset.slice(0, 1)}</span>
                  <span className="wl-info">
                    <strong>{pair.asset}</strong>
                    <small>{pair.assetName}</small>
                  </span>
                  <span className="wl-price">
                    <strong>{formatPrice(pair.domesticCurrentPrice, 'KRW')}</strong>
                    <small className={pair.buyPremiumRate >= 0 ? 'text-positive' : 'text-negative'}>
                      김프 {formatPercent(pair.buyPremiumRate)}
                    </small>
                  </span>
                  <span className="wl-sparkline">
                    <PremiumSparkline values={pair.sparkline} />
                  </span>
                </button>
                <button
                  type="button"
                  className="btn-sm btn-danger wl-remove"
                  onClick={() => remove(pair.asset)}
                  aria-label={`${pair.asset} 관심 목록에서 제거`}
                >
                  ✕
                </button>
              </div>
            )
          })}
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
              onClick={() => add(pair.asset)}
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
