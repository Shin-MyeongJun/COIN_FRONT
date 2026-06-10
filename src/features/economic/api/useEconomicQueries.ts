/**
 * economic feature 의 TanStack Query 훅.
 *
 * 컴포넌트/페이지는 이 훅만 소비한다(직접 fetch/mock 분기 금지).
 * 캐시 키는 shared/api/queryKeys.ts 의 factory 경유로만 생성한다.
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys, type EconomicCalendarRange } from '../../../shared/api/queryKeys'
import {
  fetchEconomicCorrelation,
  fetchEconomicIndicators,
  loadTimelineMarkers,
} from './economicApi'

/** 기본 조회 범위: 최근 7일 ~ 향후 1일 (mock 모드에서는 range 무시). */
function defaultCalendarRange(): EconomicCalendarRange {
  const now = Date.now()
  return { fromTs: now - 7 * 24 * 60 * 60 * 1000, toTs: now + 24 * 60 * 60 * 1000 }
}

/**
 * 타임라인 마커(경제 캘린더 → TimelineMarker).
 * mock↔real 분기는 loadTimelineMarkers(api 레이어) 한 곳에서 처리된다.
 */
export function useTimelineMarkers(range: EconomicCalendarRange = defaultCalendarRange()) {
  return useQuery({
    queryKey: queryKeys.economic.timeline(range),
    queryFn: () => loadTimelineMarkers(range),
  })
}

/** GET /economic/indicators (?category=) */
export function useEconomicIndicators(category?: string) {
  return useQuery({
    queryKey: queryKeys.economic.indicators(category),
    queryFn: () => fetchEconomicIndicators(category),
  })
}

/** GET /economic/correlation (?asset=) — asset 없으면 비활성. */
export function useEconomicCorrelation(asset: string | undefined) {
  return useQuery({
    queryKey: queryKeys.economic.correlation(asset ?? ''),
    queryFn: () => fetchEconomicCorrelation(asset as string),
    enabled: typeof asset === 'string' && asset.length > 0,
  })
}
