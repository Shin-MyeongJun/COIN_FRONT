import type { ReactNode } from 'react'
import type { SortDirection } from '../../../shared/types/common'
import { formatVolume } from '../../../shared/lib/formatNumber'
import { formatPercent } from '../../../shared/lib/formatPremium'
import { formatPrice } from '../../../shared/lib/formatPrice'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { premiumSortLabels, type PremiumPairView, type PremiumSortKey } from '../model/premiumViewTypes'
import { PremiumMetricCell } from './PremiumMetricCell'
import { PremiumSparkline } from './PremiumSparkline'

export function PremiumTable({
  pairs,
  sortDirection,
  sortKey,
  onPairSelect,
  onSort,
}: {
  pairs: PremiumPairView[]
  sortDirection: SortDirection
  sortKey: PremiumSortKey
  onPairSelect: (pair: PremiumPairView) => void
  onSort: (key: PremiumSortKey) => void
}) {
  if (pairs.length === 0) {
    return (
      <EmptyState
        title="조건에 맞는 프리미엄 페어가 없습니다."
        message="프리미엄, 표준편차, 평균, 거래량 조건을 조금 낮춰보세요."
      />
    )
  }

  return (
    <div className="table-wrap">
      <table className="premium-table">
        <thead>
          <tr>
            <th>#</th>
            <SortableHeader id="asset" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              자산
            </SortableHeader>
            <SortableHeader id="domesticCurrentPrice" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              현재가 1
            </SortableHeader>
            <SortableHeader id="offshoreCurrentPrice" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              현재가 2
            </SortableHeader>
            <SortableHeader id="buyPremiumRate" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              매수 프리미엄
            </SortableHeader>
            <SortableHeader id="sellPremiumRate" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              매도 프리미엄
            </SortableHeader>
            <SortableHeader id="premiumStdDev24h" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              24H 표준편차
            </SortableHeader>
            <SortableHeader id="premiumAverage24h" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              24H 평균
            </SortableHeader>
            <SortableHeader id="volume24h" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              거래량
            </SortableHeader>
            <th>스파크라인</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <tr key={`${pair.asset}-${pair.domesticExchange}-${pair.offshoreExchange}`} onClick={() => onPairSelect(pair)}>
              <td>{index + 1}</td>
              <td>
                <div className="asset-cell asset-cell-inline">
                  <span className="coin-symbol-badge">{pair.asset.slice(0, 1)}</span>
                  <span>
                    <strong>{pair.asset}</strong>
                    <small>{pair.assetName}</small>
                  </span>
                </div>
              </td>
              <td>
                <PriceCell
                  label={pair.domesticExchange}
                  value={pair.domesticCurrentPrice}
                  currency={pair.domesticPriceCurrency}
                />
              </td>
              <td>
                <PriceCell
                  label={`${pair.offshoreExchange} · ${pair.futuresExpiry}`}
                  value={pair.offshoreCurrentPrice}
                  currency={pair.offshorePriceCurrency}
                />
              </td>
              <td><PremiumMetricCell value={pair.buyPremiumRate} side="Buy" /></td>
              <td><PremiumMetricCell value={pair.sellPremiumRate} side="Sell" /></td>
              <td>{pair.premiumStdDev24h.toFixed(2)}%</td>
              <td><PercentCell value={pair.premiumAverage24h} /></td>
              <td>KRW {formatVolume(pair.volume24h)}</td>
              <td><PremiumSparkline values={pair.sparkline} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SortableHeader({
  id,
  activeKey,
  direction,
  onSort,
  children,
}: {
  id: PremiumSortKey
  activeKey: PremiumSortKey
  direction: SortDirection
  onSort: (key: PremiumSortKey) => void
  children: ReactNode
}) {
  const active = id === activeKey
  const marker = active ? (direction === 'asc' ? '오름차순' : '내림차순') : ''

  return (
    <th>
      <button
        aria-label={`${premiumSortLabels[id]} 기준 정렬`}
        className={active ? 'sort-button active' : 'sort-button'}
        type="button"
        onClick={() => onSort(id)}
      >
        {children}
        {marker && <span>{marker}</span>}
      </button>
    </th>
  )
}

function PercentCell({ value }: { value: number }) {
  return <span className={value >= 0 ? 'text-positive' : 'text-negative'}>{formatPercent(value)}</span>
}

function PriceCell({
  label,
  value,
  currency,
}: {
  label: string
  value: number
  currency: 'KRW' | 'USD'
}) {
  return (
    <div className="price-cell">
      <strong>{formatPrice(value, currency)}</strong>
      <span>{label}</span>
    </div>
  )
}
