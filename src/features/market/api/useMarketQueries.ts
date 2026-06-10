/**
 * market feature 의 TanStack Query 훅.
 *
 * 컴포넌트/페이지는 이 훅만 소비한다(직접 fetch/mock 분기 금지).
 * mock↔real 분기는 marketApi.ts 의 load* 함수 한 곳에서 처리된다.
 * 캐시 키는 shared/api/queryKeys.ts 의 factory 경유로만 생성한다.
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import { mapChartComposition, type ChartViewModel } from '../../chart/model/chartMappers'
import { getIntervalSec } from '../../chart/model/mockCandleData'
import { loadChartComposition, loadMarketOverview, loadTicksLatest } from './marketApi'
import type { MarketOverviewDto, TickLatestDto } from './marketTypes'

/** compose/chart 의 indicatorType 기본값(틱 기준 캔들/EMA). */
const DEFAULT_INDICATOR_TYPE = 'tick'
/** 기본으로 가져올 캔들 개수. */
const DEFAULT_BARS = 200

/** interval 기준 기본 시간 윈도우. epoch ms 반환. */
function defaultWindow(interval: string, bars = DEFAULT_BARS): { fromTs: number; toTs: number } {
  const toTs = Date.now()
  const fromTs = toTs - getIntervalSec(interval) * 1000 * bars
  return { fromTs, toTs }
}

export interface UseChartCompositionArgs {
  marketCodeId: number
  interval: string
  /** mock 모드 캔들 시드(자산 심볼). real 호출에는 영향 없음. */
  asset?: string
  indicatorType?: string
  /** 명시하지 않으면 interval 기준 기본 윈도우 사용. */
  fromTs?: number
  toTs?: number
  enabled?: boolean
}

/**
 * GET /api/v1/compose/chart/{marketCodeId}
 * DTO → lightweight-charts ViewModel(mapChartComposition)까지 변환해 반환한다.
 */
export function useChartComposition(args: UseChartCompositionArgs) {
  const indicatorType = args.indicatorType ?? DEFAULT_INDICATOR_TYPE
  const window =
    args.fromTs !== undefined && args.toTs !== undefined
      ? { fromTs: args.fromTs, toTs: args.toTs }
      : defaultWindow(args.interval)

  return useQuery<ChartViewModel>({
    queryKey: queryKeys.compose.chart(args.marketCodeId, args.interval, indicatorType),
    enabled: (args.enabled ?? true) && args.marketCodeId > 0,
    queryFn: async () => {
      const dto = await loadChartComposition({
        marketCodeId: args.marketCodeId,
        interval: args.interval,
        indicatorType,
        fromTs: window.fromTs,
        toTs: window.toTs,
        asset: args.asset,
      })
      return mapChartComposition(dto)
    },
  })
}

export interface UseMarketOverviewArgs {
  marketCodeId: number
  base?: string
  indicatorMarketCodeIds?: number[]
  interval: string
  indicatorType?: string
  asset?: string
  enabled?: boolean
}

/** GET /api/v1/compose/market-overview/{marketCodeId} */
export function useMarketOverview(args: UseMarketOverviewArgs) {
  return useQuery<MarketOverviewDto>({
    queryKey: queryKeys.compose.marketOverview(args.marketCodeId),
    enabled: (args.enabled ?? true) && args.marketCodeId > 0,
    queryFn: () =>
      loadMarketOverview({
        marketCodeId: args.marketCodeId,
        base: args.base,
        indicatorMarketCodeIds: args.indicatorMarketCodeIds,
        interval: args.interval,
        indicatorType: args.indicatorType ?? DEFAULT_INDICATOR_TYPE,
        asset: args.asset,
      }),
  })
}

/**
 * GET /api/v1/market/ticks/latest (?marketCodeIds=1,2,3)
 * 2초 간격 폴링(실시간 호가). marketCodeIds 가 비면 비활성.
 */
export function useTicksLatest(marketCodeIds: number[], enabled = true) {
  return useQuery<TickLatestDto[]>({
    queryKey: queryKeys.market.ticksLatest(marketCodeIds),
    enabled: enabled && marketCodeIds.length > 0,
    queryFn: () => loadTicksLatest(marketCodeIds),
    refetchInterval: 2000,
  })
}
