/**
 * Watchlist REST surface.
 *
 * All endpoints require a logged-in account (JWT) — httpClient default auth:true
 * is used. ApiKey-principal callers are rejected by the backend.
 *
 * Mock fallback (env.useMock) ships a local in-memory list so the UI is
 * runnable without the backend. The mock keeps DELETE/POST consistent with
 * the real endpoint shapes (offset page envelope, 201/204 semantics).
 */

import { API_ENDPOINTS } from '@/shared/api/endpoints'
import { del, getJson, postJson } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'
import type { OffsetPage } from '@/shared/api/types'
import type {
  AddWatchlistRequest,
  AddWatchlistResponse,
  WatchlistItemDto,
} from './watchlistTypes'

export const watchlistApiPaths = API_ENDPOINTS.watchlist

// ── Real backend calls ─────────────────────────────────────────────────────

export function fetchWatchlist(params: {
  page: number
  size: number
}): Promise<OffsetPage<WatchlistItemDto>> {
  if (env.useMock) return Promise.resolve(mockOffsetPage(params))
  return getJson<OffsetPage<WatchlistItemDto>>(watchlistApiPaths.list, {
    page: params.page,
    size: params.size,
  })
}

export function addWatchlist(body: AddWatchlistRequest): Promise<AddWatchlistResponse> {
  if (env.useMock) return Promise.resolve(mockAdd(body))
  return postJson<AddWatchlistResponse, AddWatchlistRequest>(watchlistApiPaths.list, body)
}

export function removeWatchlist(id: number): Promise<void> {
  if (env.useMock) {
    mockRemove(id)
    return Promise.resolve()
  }
  return del<void>(watchlistApiPaths.item(id))
}

// ── Mock store (env.useMock=true only) ─────────────────────────────────────

const MOCK_INITIAL: WatchlistItemDto[] = [
  { id: 1, userId: 1, marketCodeId: 101, asset: 'BTC', assetName: '비트코인', pinnedAt: Date.now() - 7 * 86_400_000 },
  { id: 2, userId: 1, marketCodeId: 102, asset: 'ETH', assetName: '이더리움', pinnedAt: Date.now() - 5 * 86_400_000 },
  { id: 3, userId: 1, marketCodeId: 103, asset: 'XRP', assetName: '리플', pinnedAt: Date.now() - 3 * 86_400_000 },
  { id: 4, userId: 1, marketCodeId: 104, asset: 'SOL', assetName: '솔라나', pinnedAt: Date.now() - 86_400_000 },
]
let mockItems: WatchlistItemDto[] = [...MOCK_INITIAL]
let mockNextId = MOCK_INITIAL.length + 1

function mockOffsetPage(p: { page: number; size: number }): OffsetPage<WatchlistItemDto> {
  const sorted = [...mockItems].sort((a, b) => b.pinnedAt - a.pinnedAt)
  const start = p.page * p.size
  return {
    items: sorted.slice(start, start + p.size),
    page: p.page,
    size: p.size,
    total: mockItems.length,
  }
}

function mockAdd(body: AddWatchlistRequest): WatchlistItemDto {
  const existing = mockItems.find((m) => m.asset === body.asset)
  if (existing !== undefined) return existing
  const created: WatchlistItemDto = {
    id: mockNextId++,
    userId: 1,
    marketCodeId: 1000 + mockNextId,
    asset: body.asset,
    assetName: body.asset,
    pinnedAt: Date.now(),
  }
  mockItems = [...mockItems, created]
  return created
}

function mockRemove(id: number): void {
  mockItems = mockItems.filter((m) => m.id !== id)
}
