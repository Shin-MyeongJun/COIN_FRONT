import type { SortDirection } from '../../../shared/types/common'
import type { PremiumPairView, PremiumSortKey } from './premiumViewTypes'

export interface PremiumFilters {
  keyword: string
  domesticExchange: string
  offshoreExchange: string
  futuresExpiry: string
  minBuyPremiumRate: string
  maxBuyPremiumRate: string
  minPremiumStdDev24h: string
  minPremiumAverage24h: string
  minVolume24h: string
}

export const defaultPremiumFilters: PremiumFilters = {
  keyword: '',
  domesticExchange: 'Upbit',
  offshoreExchange: 'Binance Futures',
  futuresExpiry: '무기한',
  minBuyPremiumRate: '',
  maxBuyPremiumRate: '',
  minPremiumStdDev24h: '',
  minPremiumAverage24h: '',
  minVolume24h: '',
}

export interface PremiumFilterOptions {
  domesticExchanges: string[]
  offshoreExchanges: string[]
  futuresExpiries: string[]
}

export function getPremiumFilterOptions(pairs: PremiumPairView[]): PremiumFilterOptions {
  return {
    domesticExchanges: Array.from(new Set(pairs.map((pair) => pair.domesticExchange))),
    offshoreExchanges: Array.from(new Set(pairs.map((pair) => pair.offshoreExchange))),
    futuresExpiries: Array.from(new Set(pairs.map((pair) => pair.futuresExpiry))),
  }
}

export function filterAndSortPremiumPairs({
  pairs,
  filters,
  sortKey,
  sortDirection,
}: {
  pairs: PremiumPairView[]
  filters: PremiumFilters
  sortKey: PremiumSortKey
  sortDirection: SortDirection
}) {
  const keyword = filters.keyword.trim().toLowerCase()
  const minBuy = Number(filters.minBuyPremiumRate || Number.NEGATIVE_INFINITY)
  const maxBuy = Number(filters.maxBuyPremiumRate || Number.POSITIVE_INFINITY)
  const minStdDev = Number(filters.minPremiumStdDev24h || Number.NEGATIVE_INFINITY)
  const minAverage = Number(filters.minPremiumAverage24h || Number.NEGATIVE_INFINITY)
  const minVolume = Number(filters.minVolume24h || 0) * 1_000_000_000

  return pairs
    .filter((pair) => {
      const matchesKeyword =
        !keyword ||
        pair.asset.toLowerCase().includes(keyword) ||
        pair.assetName.toLowerCase().includes(keyword)

      return (
        matchesKeyword &&
        pair.domesticExchange === filters.domesticExchange &&
        pair.offshoreExchange === filters.offshoreExchange &&
        pair.futuresExpiry === filters.futuresExpiry &&
        pair.buyPremiumRate >= minBuy &&
        pair.buyPremiumRate <= maxBuy &&
        pair.premiumStdDev24h >= minStdDev &&
        pair.premiumAverage24h >= minAverage &&
        pair.volume24h >= minVolume
      )
    })
    .sort((first, second) => {
      const firstValue = first[sortKey]
      const secondValue = second[sortKey]
      const direction = sortDirection === 'asc' ? 1 : -1

      if (typeof firstValue === 'string' && typeof secondValue === 'string') {
        return firstValue.localeCompare(secondValue) * direction
      }

      return (Number(firstValue) - Number(secondValue)) * direction
    })
}
