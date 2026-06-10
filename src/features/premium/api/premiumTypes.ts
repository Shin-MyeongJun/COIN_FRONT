/**
 * Premium DTOs — wire-format types as returned by the backend.
 *
 * Convention (see CLAUDE.md): time = epoch ms (number, UTC),
 * rate / price = string (BigDecimal — precision preserved).
 *
 * Components MUST NOT consume these directly; convert to `PremiumPairView`
 * via `premiumMappers`.
 */

export interface PremiumRankingDto {
  baseExchangeId: number
  compareExchangeId: number
  symbol: string
  /** BigDecimal as string. Some endpoints return a single rate. */
  premiumRate?: string
  /** BigDecimal as string. Present when buy/sell are split. */
  buyPremiumRate?: string
  /** BigDecimal as string. Present when buy/sell are split. */
  sellPremiumRate?: string
  ts: number
}

export interface PremiumSnapshotDto {
  baseExchangeId: number
  compareExchangeId: number
  symbol: string
  /** BigDecimal as string. */
  premiumRate: string
  ts: number
}

export interface PremiumTimeSeriesDto {
  bucketTs: number
  /** BigDecimal as string. */
  premiumRate: string
}

/**
 * Payload of the public `premium` SSE event (/api/v1/stream/premium).
 * Loosely typed — the raw event is untrusted. Rates may arrive as string
 * (BigDecimal) per the contract.
 */
export interface PremiumStreamEvent {
  symbol?: string
  base?: string
  premiumRate?: number | string
  buyPremiumRate?: number | string
  sellPremiumRate?: number | string
  ts?: number
}
