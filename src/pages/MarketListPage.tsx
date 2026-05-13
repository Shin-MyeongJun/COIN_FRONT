import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMockPremiumPairs } from '../features/premium/api/premiumApi'
import { PremiumSparkline } from '../features/premium/components/PremiumSparkline'
import type { PremiumPairView, PremiumSortKey } from '../features/premium/model/premiumViewTypes'
import { formatVolume } from '../shared/lib/formatNumber'
import { formatPercent } from '../shared/lib/formatPremium'
import { formatPrice } from '../shared/lib/formatPrice'
import type { SortDirection } from '../shared/types/common'

const ALL_PAIRS = getMockPremiumPairs()
const PAGE_SIZE = 5

export function MarketListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<PremiumSortKey>('buyPremiumRate')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return ALL_PAIRS.filter(
      (p) => p.asset.toLowerCase().includes(q) || p.assetName.toLowerCase().includes(q),
    )
  }, [search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: PremiumSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'asset' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  return (
    <main className="market-list-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Markets</p>
          <h1>마켓 리스트</h1>
        </div>
      </div>

      <div className="market-search-bar">
        <label htmlFor="market-search" className="visually-hidden">마켓 검색</label>
        <input
          id="market-search"
          type="search"
          placeholder="코인 검색 (예: BTC, 이더리움)"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <span className="search-count">{filtered.length}개 결과</span>
      </div>

      <div className="table-wrap">
        <table className="premium-table market-table">
          <thead>
            <tr>
              <th>#</th>
              <SortTh id="asset" active={sortKey === 'asset'} dir={sortDir} onSort={toggleSort}>자산</SortTh>
              <SortTh id="domesticCurrentPrice" active={sortKey === 'domesticCurrentPrice'} dir={sortDir} onSort={toggleSort}>국내 현재가</SortTh>
              <SortTh id="offshoreCurrentPrice" active={sortKey === 'offshoreCurrentPrice'} dir={sortDir} onSort={toggleSort}>해외 현재가</SortTh>
              <SortTh id="buyPremiumRate" active={sortKey === 'buyPremiumRate'} dir={sortDir} onSort={toggleSort}>매수 프리미엄</SortTh>
              <SortTh id="volume24h" active={sortKey === 'volume24h'} dir={sortDir} onSort={toggleSort}>24H 거래량</SortTh>
              <th>스파크라인</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((pair, i) => (
              <MarketRow
                key={`${pair.asset}-${pair.offshoreExchange}`}
                pair={pair}
                rank={(page - 1) * PAGE_SIZE + i + 1}
                onClick={() => navigate(`/market/${pair.asset}`)}
              />
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" className={p === page ? 'active' : ''} onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>다음</button>
        </div>
      )}
    </main>
  )
}

function MarketRow({ pair, rank, onClick }: { pair: PremiumPairView; rank: number; onClick: () => void }) {
  return (
    <tr style={{ cursor: 'pointer' }} onClick={onClick}>
      <td>{rank}</td>
      <td>
        <div className="asset-cell asset-cell-inline">
          <span className="coin-symbol-badge">{pair.asset.slice(0, 1)}</span>
          <span>
            <strong>{pair.asset}</strong>
            <small>{pair.assetName}</small>
          </span>
        </div>
      </td>
      <td>{formatPrice(pair.domesticCurrentPrice, 'KRW')}</td>
      <td>{formatPrice(pair.offshoreCurrentPrice, 'USD')}</td>
      <td className={pair.buyPremiumRate >= 0 ? 'text-positive' : 'text-negative'}>
        {formatPercent(pair.buyPremiumRate)}
      </td>
      <td>KRW {formatVolume(pair.volume24h)}</td>
      <td><PremiumSparkline values={pair.sparkline} /></td>
    </tr>
  )
}

function SortTh({
  id,
  active,
  dir,
  children,
  onSort,
}: {
  id: PremiumSortKey
  active: boolean
  dir: SortDirection
  children: React.ReactNode
  onSort: (k: PremiumSortKey) => void
}) {
  return (
    <th>
      <button className={active ? 'sort-button active' : 'sort-button'} type="button" onClick={() => onSort(id)}>
        {children}
        {active && <span>{dir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  )
}
