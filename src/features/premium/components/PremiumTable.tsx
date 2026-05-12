import type { ReactNode } from 'react'
import type { SortDirection } from '../../../shared/types/common'
import { formatVolume } from '../../../shared/lib/formatNumber'
import { formatPercent } from '../../../shared/lib/formatPremium'
import { formatPrice } from '../../../shared/lib/formatPrice'
import { formatRelativeTime } from '../../../shared/lib/formatTime'
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
        title="No premium pairs match the filters."
        message="Relax one or two thresholds to bring live rows back into view."
      />
    )
  }

  return (
    <div className="table-wrap">
      <table className="premium-table">
        <thead>
          <tr>
            <SortableHeader id="asset" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              Asset
            </SortableHeader>
            <th>Domestic</th>
            <th>Offshore</th>
            <th>Domestic bid</th>
            <th>Offshore ask</th>
            <SortableHeader id="buyPremiumRate" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              Buy Premium
            </SortableHeader>
            <th>Domestic ask</th>
            <th>Offshore bid</th>
            <SortableHeader id="sellPremiumRate" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              Sell Premium
            </SortableHeader>
            <SortableHeader id="oneHourChangeRate" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              1h
            </SortableHeader>
            <SortableHeader id="twentyFourHourChangeRate" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              24h
            </SortableHeader>
            <SortableHeader id="volume" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              Volume
            </SortableHeader>
            <SortableHeader id="lastUpdatedAt" activeKey={sortKey} direction={sortDirection} onSort={onSort}>
              Updated
            </SortableHeader>
            <th>Spark</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr key={`${pair.asset}-${pair.domesticExchange}-${pair.offshoreExchange}`} onClick={() => onPairSelect(pair)}>
              <td>
                <div className="asset-cell">
                  <strong>{pair.asset}</strong>
                  <span>{pair.assetName}</span>
                </div>
              </td>
              <td>{pair.domesticExchange}</td>
              <td>{pair.offshoreExchange}</td>
              <td>{formatPrice(pair.domesticBid)}</td>
              <td>{formatPrice(pair.offshoreAsk)}</td>
              <td><PremiumMetricCell value={pair.buyPremiumRate} side="Buy" /></td>
              <td>{formatPrice(pair.domesticAsk)}</td>
              <td>{formatPrice(pair.offshoreBid)}</td>
              <td><PremiumMetricCell value={pair.sellPremiumRate} side="Sell" /></td>
              <td><PercentCell value={pair.oneHourChangeRate} /></td>
              <td><PercentCell value={pair.twentyFourHourChangeRate} /></td>
              <td>KRW {formatVolume(pair.volume)}</td>
              <td>{formatRelativeTime(pair.lastUpdatedAt)}</td>
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
  const marker = active ? (direction === 'asc' ? 'up' : 'down') : ''

  return (
    <th>
      <button
        aria-label={`Sort by ${premiumSortLabels[id]}`}
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
