import type { TickLatestView } from '../../../shared/api/types'

/**
 * Backend DTOs for compose/market endpoints.
 *
 * Contract reminders (see CLAUDE.md):
 *   - time fields  = epoch milliseconds (number, UTC)
 *   - 금액/환율/김프 = string (BigDecimal — precision preserved)
 * DTO → ViewModel 변환은 chart/model/chartMappers.ts 에서만 수행한다.
 */

/** 단일 캔들 (compose/chart 응답의 candles[] 원소). OHLC/volume 은 BigDecimal string. */
export interface ChartCandleDto {
  /** 버킷 시작 시각 — epoch ms (UTC) */
  bucketOpenTs: number
  open: string
  high: string
  low: string
  close: string
  volume?: string
  marketCodeId?: number
  interval?: string
}

/** 지표 시계열의 한 점. ts=epoch ms, value=BigDecimal string. */
export interface IndicatorPointDto {
  ts: number
  value: string
}

/** EMA20/EMA50 등 overlay 지표 한 종류의 시계열. */
export interface IndicatorSeriesDto {
  /** 지표 식별자 — 예: "EMA20", "EMA50" */
  name: string
  indicatorType?: string
  points: IndicatorPointDto[]
}

/** 차트 위에 표시되는 이벤트 마커 (경제/뉴스 등). */
export interface ChartEventDto {
  ts: number
  type?: string
  title?: string
  detail?: string
}

/** GET /api/v1/compose/chart/{marketCodeId} 응답. */
export interface ChartCompositionDto {
  marketCodeId?: number
  interval?: string
  candles: ChartCandleDto[]
  indicators?: IndicatorSeriesDto[]
  events?: ChartEventDto[]
}

/** GET /api/v1/market/ticks/latest 응답 원소. */
export type TickLatestDto = TickLatestView

/** GET /api/v1/compose/market-overview/{marketCodeId} 응답. */
export interface MarketOverviewDto {
  marketCodeId: number
  base?: string
  composition?: ChartCompositionDto
  /** 기준 마켓의 최신 호가 */
  latestTick?: TickLatestDto
  /** indicatorMarketCodeIds 로 요청한 비교 마켓들의 최신 호가 */
  indicatorTicks?: TickLatestDto[]
}
