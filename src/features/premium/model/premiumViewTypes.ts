export type PremiumSide = 'BUY' | 'SELL'

export interface PremiumPairView {
  asset: string
  assetName: string
  quoteCurrency: string
  domesticExchange: string
  offshoreExchange: string
  domesticBid: number
  offshoreAsk: number
  buyPremiumRate: number
  domesticAsk: number
  offshoreBid: number
  sellPremiumRate: number
  oneHourChangeRate: number
  twentyFourHourChangeRate: number
  volume: number
  lastUpdatedAt: number
  sparkline: number[]
}

export type PremiumSortKey =
  | 'asset'
  | 'buyPremiumRate'
  | 'sellPremiumRate'
  | 'oneHourChangeRate'
  | 'twentyFourHourChangeRate'
  | 'volume'
  | 'lastUpdatedAt'

export const premiumSortLabels: Record<PremiumSortKey, string> = {
  asset: 'Asset',
  buyPremiumRate: 'Buy premium',
  sellPremiumRate: 'Sell premium',
  oneHourChangeRate: '1h',
  twentyFourHourChangeRate: '24h',
  volume: 'Volume',
  lastUpdatedAt: 'Freshness',
}
