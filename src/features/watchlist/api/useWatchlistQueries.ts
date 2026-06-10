/**
 * Watchlist React Query hooks.
 *
 * - useWatchlistQuery        — offset-paged list
 * - useAddWatchlistMutation  — POST + invalidate
 * - useRemoveWatchlistMutation — DELETE + invalidate (optimistic remove for snappy UX)
 *
 * All mutations invalidate `queryKeys.watchlist.all` so any open list view
 * refetches.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import type { OffsetPage } from '@/shared/api/types'
import { addWatchlist, fetchWatchlist, removeWatchlist } from './watchlistApi'
import type { AddWatchlistRequest, WatchlistItemDto } from './watchlistTypes'

const DEFAULT_PAGE_SIZE = 50

export function useWatchlistQuery(
  params: { page?: number; size?: number } = {},
) {
  const page = params.page ?? 0
  const size = params.size ?? DEFAULT_PAGE_SIZE
  return useQuery<OffsetPage<WatchlistItemDto>>({
    queryKey: queryKeys.watchlist.list({ page, size }),
    queryFn: () => fetchWatchlist({ page, size }),
    staleTime: 30_000,
  })
}

export function useAddWatchlistMutation() {
  const qc = useQueryClient()
  return useMutation<WatchlistItemDto, unknown, AddWatchlistRequest>({
    mutationFn: (body) => addWatchlist(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.watchlist.all }),
  })
}

export function useRemoveWatchlistMutation() {
  const qc = useQueryClient()
  return useMutation<void, unknown, { id: number }>({
    mutationFn: ({ id }) => removeWatchlist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.watchlist.all }),
  })
}
