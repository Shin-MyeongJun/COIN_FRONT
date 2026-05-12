import { getJson } from '../../../shared/api/httpClient'
import type { PremiumPairView } from '../model/premiumViewTypes'
import type { PremiumRankingDto, PremiumSnapshotDto, PremiumTimeSeriesDto } from './premiumTypes'

const now = Date.now()

export const premiumApiPaths = {
  ranking: '/api/v1/market/premium/ranking',
  snapshot: (base: string) => `/api/v1/market/premium/snapshot/${base}`,
  series: '/api/v1/market/premium/series',
}

export function getMockPremiumPairs(): PremiumPairView[] {
  return [
    {
      asset: 'BTC',
      assetName: 'Bitcoin',
      quoteCurrency: 'KRW',
      domesticExchange: 'Upbit',
      offshoreExchange: 'Binance',
      domesticBid: 146_320_000,
      offshoreAsk: 140_118_000,
      buyPremiumRate: 4.43,
      domesticAsk: 146_370_000,
      offshoreBid: 140_060_000,
      sellPremiumRate: 4.51,
      oneHourChangeRate: 0.18,
      twentyFourHourChangeRate: 1.92,
      volume: 1_842_000_000_000,
      lastUpdatedAt: now - 12_000,
      sparkline: [3.92, 4.04, 4.16, 4.08, 4.25, 4.31, 4.43],
    },
    {
      asset: 'ETH',
      assetName: 'Ethereum',
      quoteCurrency: 'KRW',
      domesticExchange: 'Bithumb',
      offshoreExchange: 'Coinbase',
      domesticBid: 7_815_000,
      offshoreAsk: 7_516_000,
      buyPremiumRate: 3.98,
      domesticAsk: 7_819_000,
      offshoreBid: 7_504_000,
      sellPremiumRate: 4.2,
      oneHourChangeRate: -0.06,
      twentyFourHourChangeRate: 0.83,
      volume: 932_000_000_000,
      lastUpdatedAt: now - 22_000,
      sparkline: [4.31, 4.16, 4.08, 4.02, 3.94, 4.01, 3.98],
    },
    {
      asset: 'SOL',
      assetName: 'Solana',
      quoteCurrency: 'KRW',
      domesticExchange: 'Upbit',
      offshoreExchange: 'Binance',
      domesticBid: 242_400,
      offshoreAsk: 234_090,
      buyPremiumRate: 3.55,
      domesticAsk: 242_600,
      offshoreBid: 233_860,
      sellPremiumRate: 3.74,
      oneHourChangeRate: 0.42,
      twentyFourHourChangeRate: 2.36,
      volume: 386_000_000_000,
      lastUpdatedAt: now - 18_000,
      sparkline: [3.02, 3.14, 3.2, 3.34, 3.39, 3.48, 3.55],
    },
    {
      asset: 'XRP',
      assetName: 'XRP',
      quoteCurrency: 'KRW',
      domesticExchange: 'Upbit',
      offshoreExchange: 'OKX',
      domesticBid: 4_065,
      offshoreAsk: 3_938,
      buyPremiumRate: 3.23,
      domesticAsk: 4_067,
      offshoreBid: 3_929,
      sellPremiumRate: 3.51,
      oneHourChangeRate: 0.04,
      twentyFourHourChangeRate: -0.76,
      volume: 512_000_000_000,
      lastUpdatedAt: now - 45_000,
      sparkline: [3.42, 3.36, 3.21, 3.18, 3.27, 3.25, 3.23],
    },
    {
      asset: 'DOGE',
      assetName: 'Dogecoin',
      quoteCurrency: 'KRW',
      domesticExchange: 'Bithumb',
      offshoreExchange: 'Binance',
      domesticBid: 422.8,
      offshoreAsk: 410.7,
      buyPremiumRate: 2.95,
      domesticAsk: 423.1,
      offshoreBid: 409.8,
      sellPremiumRate: 3.25,
      oneHourChangeRate: -0.28,
      twentyFourHourChangeRate: 1.11,
      volume: 188_000_000_000,
      lastUpdatedAt: now - 62_000,
      sparkline: [3.08, 3.12, 3.0, 2.97, 2.88, 2.92, 2.95],
    },
    {
      asset: 'ADA',
      assetName: 'Cardano',
      quoteCurrency: 'KRW',
      domesticExchange: 'Coinone',
      offshoreExchange: 'Kraken',
      domesticBid: 1_382,
      offshoreAsk: 1_345,
      buyPremiumRate: 2.75,
      domesticAsk: 1_384,
      offshoreBid: 1_342,
      sellPremiumRate: 3.13,
      oneHourChangeRate: 0.12,
      twentyFourHourChangeRate: -0.21,
      volume: 76_000_000_000,
      lastUpdatedAt: now - 88_000,
      sparkline: [2.55, 2.62, 2.71, 2.68, 2.79, 2.77, 2.75],
    },
    {
      asset: 'AVAX',
      assetName: 'Avalanche',
      quoteCurrency: 'KRW',
      domesticExchange: 'Upbit',
      offshoreExchange: 'Bybit',
      domesticBid: 48_820,
      offshoreAsk: 47_590,
      buyPremiumRate: 2.58,
      domesticAsk: 48_850,
      offshoreBid: 47_470,
      sellPremiumRate: 2.91,
      oneHourChangeRate: -0.18,
      twentyFourHourChangeRate: 0.44,
      volume: 92_000_000_000,
      lastUpdatedAt: now - 132_000,
      sparkline: [2.85, 2.81, 2.76, 2.69, 2.62, 2.6, 2.58],
    },
  ]
}

export function fetchPremiumRanking(limit = 10) {
  return getJson<PremiumRankingDto[]>(premiumApiPaths.ranking, { n: limit })
}

export function fetchPremiumSnapshot(base: string) {
  return getJson<PremiumSnapshotDto[]>(premiumApiPaths.snapshot(base))
}

export function fetchPremiumSeries(params: {
  baseExchangeId: number
  compareExchangeId: number
  symbol: string
  bucketSeconds: number
  fromTs: number
  toTs: number
}) {
  return getJson<PremiumTimeSeriesDto[]>(premiumApiPaths.series, params)
}
