/**
 * TanStack Query hooks for the premium feature.
 *
 * All hooks return ViewModels (never DTOs) — the api layer hides the
 * mock↔real split and the mapper handles the DTO→VM conversion.
 *
 * Cache keys come from `queryKeys.premium` so we can invalidate by prefix.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import type { ApiError } from '../../../shared/api/apiError'
import type { PremiumPairView } from '../model/premiumViewTypes'
import {
  getPremiumRankingView,
  getPremiumSeriesView,
  getPremiumSnapshotView,
  type PremiumSeriesParams,
} from './premiumApi'
import type { PremiumTimeSeriesDto } from './premiumTypes'

type Options<T> = Omit<UseQueryOptions<T, ApiError, T>, 'queryKey' | 'queryFn'>

const RANKING_STALE_MS = 15_000
const SNAPSHOT_STALE_MS = 10_000
const SERIES_STALE_MS = 30_000

export function usePremiumRankingQuery(limit = 10, options?: Options<PremiumPairView[]>) {
  return useQuery<PremiumPairView[], ApiError>({
    queryKey: queryKeys.premium.ranking(limit),
    queryFn: () => getPremiumRankingView(limit),
    staleTime: RANKING_STALE_MS,
    ...options,
  })
}

export function usePremiumSnapshotQuery(base: string, options?: Options<PremiumPairView[]>) {
  return useQuery<PremiumPairView[], ApiError>({
    queryKey: queryKeys.premium.snapshot(base),
    queryFn: () => getPremiumSnapshotView(base),
    enabled: base.length > 0,
    staleTime: SNAPSHOT_STALE_MS,
    ...options,
  })
}

export function usePremiumSeriesQuery(
  params: PremiumSeriesParams,
  options?: Options<PremiumTimeSeriesDto[]>,
) {
  return useQuery<PremiumTimeSeriesDto[], ApiError>({
    queryKey: queryKeys.premium.series(params),
    queryFn: () => getPremiumSeriesView(params),
    staleTime: SERIES_STALE_MS,
    ...options,
  })
}
