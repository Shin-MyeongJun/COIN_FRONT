/**
 * DTO → ViewModel mappers for the premium feature.
 *
 * Backend rate fields are BigDecimal-as-string; UI displays numbers.
 * Conversion happens here so components never see raw DTOs.
 *
 * NOTE: PremiumRankingDto exposes only {symbol, rate, ts, exchangeIds}.
 * Display-only fields (assetName, exchange labels, prices, sparkline, …)
 * have no backend source yet, so we fall back to symbol-derived / empty
 * placeholders. When the backend exposes these, only this mapper needs to
 * change — components / pages stay untouched.
 */

import type { PremiumPairView } from './premiumViewTypes'
import type { PremiumRankingDto } from '../api/premiumTypes'

/**
 * Parse a BigDecimal string into a number for display purposes only.
 * Returns 0 if the value is missing or unparseable (avoids NaN in tables).
 */
function parseRate(value: string | undefined): number {
  if (value === undefined) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * When the backend returns only `premiumRate` (single value), use it for both
 * sides; when buy/sell are split, prefer those.
 */
function pickBuyRate(dto: PremiumRankingDto): number {
  return parseRate(dto.buyPremiumRate ?? dto.premiumRate)
}

function pickSellRate(dto: PremiumRankingDto): number {
  return parseRate(dto.sellPremiumRate ?? dto.premiumRate)
}

export function toPremiumPairView(dto: PremiumRankingDto): PremiumPairView {
  const buy = pickBuyRate(dto)
  const sell = pickSellRate(dto)
  return {
    asset: dto.symbol,
    assetName: dto.symbol,
    domesticExchange: 'Upbit',
    offshoreExchange: 'Binance Futures',
    offshoreMarketType: 'USDT-M 선물',
    futuresExpiry: '무기한',
    domesticPriceCurrency: 'KRW',
    offshorePriceCurrency: 'USD',
    domesticCurrentPrice: 0,
    offshoreCurrentPrice: 0,
    domesticBid: 0,
    offshoreAsk: 0,
    buyPremiumRate: buy,
    domesticAsk: 0,
    offshoreBid: 0,
    sellPremiumRate: sell,
    premiumStdDev24h: 0,
    premiumAverage24h: 0,
    volume24h: 0,
    lastUpdatedAt: dto.ts,
    sparkline: [],
  }
}

export function toPremiumPairViews(dtos: readonly PremiumRankingDto[]): PremiumPairView[] {
  return dtos.map(toPremiumPairView)
}
