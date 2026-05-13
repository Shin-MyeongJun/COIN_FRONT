export type PremiumSide = 'BUY' | 'SELL'

export interface PremiumPairView {
  asset: string
  assetName: string
  domesticExchange: string
  offshoreExchange: string
  offshoreMarketType: string
  futuresExpiry: string
  domesticPriceCurrency: 'KRW'
  offshorePriceCurrency: 'USD'
  domesticCurrentPrice: number
  offshoreCurrentPrice: number
  domesticBid: number
  offshoreAsk: number
  buyPremiumRate: number
  domesticAsk: number
  offshoreBid: number
  sellPremiumRate: number
  premiumStdDev24h: number
  premiumAverage24h: number
  volume24h: number
  lastUpdatedAt: number
  sparkline: number[]
}

export type PremiumSortKey =
  | 'asset'
  | 'domesticCurrentPrice'
  | 'offshoreCurrentPrice'
  | 'buyPremiumRate'
  | 'sellPremiumRate'
  | 'premiumStdDev24h'
  | 'premiumAverage24h'
  | 'volume24h'
  | 'lastUpdatedAt'

export const premiumSortLabels: Record<PremiumSortKey, string> = {
  asset: '자산',
  domesticCurrentPrice: '업비트 현재가',
  offshoreCurrentPrice: '바이낸스 현재가',
  buyPremiumRate: '매수 프리미엄',
  sellPremiumRate: '매도 프리미엄',
  premiumStdDev24h: '24H 표준편차',
  premiumAverage24h: '24H 평균',
  volume24h: '거래량',
  lastUpdatedAt: '업데이트',
}
