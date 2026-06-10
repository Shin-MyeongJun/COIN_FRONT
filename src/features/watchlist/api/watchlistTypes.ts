/**
 * Backend Watchlist DTO mirror.
 *
 * Endpoint: /api/v1/watchlist/** (JWT-only, ApiKey principal rejected)
 *
 * - Pagination: OFFSET envelope `{ items, page, size, total }` (?page=&size=)
 * - Timestamps: epoch milliseconds (UTC)
 * - Sorting key: `pinnedAt` desc (most recently pinned first)
 */

export type WatchlistItemDto = {
  id: number
  userId: number
  /** Backend's market_code FK — kept for join-back to other features. */
  marketCodeId: number
  /** Short asset symbol, e.g. "BTC". */
  asset: string
  /** Display name, e.g. "비트코인". Optional — may be backfilled from meta. */
  assetName?: string
  pinnedAt: number
}

export type AddWatchlistRequest = {
  /** Symbol to pin. Backend resolves to marketCodeId internally. */
  asset: string
}

export type AddWatchlistResponse = WatchlistItemDto
