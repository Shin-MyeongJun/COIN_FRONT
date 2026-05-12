export interface PremiumRankingDto {
  baseExchangeId?: number
  compareExchangeId?: number
  symbol: string
  premiumRate?: number
  buyPremiumRate?: number
  sellPremiumRate?: number
  ts?: number
}

export interface PremiumSnapshotDto {
  baseExchangeId: number
  compareExchangeId: number
  symbol: string
  premiumRate: number
  ts: number
}

export interface PremiumTimeSeriesDto {
  bucketTs: number
  premiumRate: number
}
