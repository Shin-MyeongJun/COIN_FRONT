import type { SortDirection } from '../../../shared/types/common'
import type { PremiumPairView, PremiumSortKey } from './premiumViewTypes'

export interface PremiumFilters {
  keyword: string
  domesticExchange: string
  offshoreExchange: string
  quoteCurrency: string
  minBuyPremiumRate: string
  minSellPremiumRate: string
  minVolume: string
  freshnessSeconds: string
  elevatedOnly: boolean
}

export const defaultPremiumFilters: PremiumFilters = {
  keyword: '',
  domesticExchange: 'ALL',
  offshoreExchange: 'ALL',
  quoteCurrency: 'ALL',
  minBuyPremiumRate: '',
  minSellPremiumRate: '',
  minVolume: '',
  freshnessSeconds: '180',
  elevatedOnly: false,
}

export interface PremiumFilterOptions {
  domesticExchanges: string[]
  offshoreExchanges: string[]
  quoteCurrencies: string[]
}

export function getPremiumFilterOptions(pairs: PremiumPairView[]): PremiumFilterOptions {
  return {
    domesticExchanges: ['ALL', ...Array.from(new Set(pairs.map((pair) => pair.domesticExchange)))],
    offshoreExchanges: ['ALL', ...Array.from(new Set(pairs.map((pair) => pair.offshoreExchange)))],
    quoteCurrencies: ['ALL', ...Array.from(new Set(pairs.map((pair) => pair.quoteCurrency)))],
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
  const minSell = Number(filters.minSellPremiumRate || Number.NEGATIVE_INFINITY)
  const minVolume = Number(filters.minVolume || 0) * 1_000_000_000
  const freshnessLimit = Number(filters.freshnessSeconds || 0) * 1000

  return pairs
    .filter((pair) => {
      const matchesKeyword =
        !keyword ||
        pair.asset.toLowerCase().includes(keyword) ||
        pair.assetName.toLowerCase().includes(keyword)
      const freshEnough = !freshnessLimit || Date.now() - pair.lastUpdatedAt <= freshnessLimit

      return (
        matchesKeyword &&
        (filters.domesticExchange === 'ALL' || pair.domesticExchange === filters.domesticExchange) &&
        (filters.offshoreExchange === 'ALL' || pair.offshoreExchange === filters.offshoreExchange) &&
        (filters.quoteCurrency === 'ALL' || pair.quoteCurrency === filters.quoteCurrency) &&
        pair.buyPremiumRate >= minBuy &&
        pair.sellPremiumRate >= minSell &&
        pair.volume >= minVolume &&
        freshEnough &&
        (!filters.elevatedOnly || pair.buyPremiumRate >= 3.5 || pair.sellPremiumRate >= 3.5)
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
