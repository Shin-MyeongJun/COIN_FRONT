import { getJson } from '../../../shared/api/httpClient'
import { env } from '../../../shared/config/env'
import type { CandlePoint } from '../../chart/model/chartTypes'
import { getMockCandleData } from '../../chart/model/mockCandleData'
import type {
  ChartCandleDto,
  ChartCompositionDto,
  IndicatorPointDto,
  IndicatorSeriesDto,
  MarketOverviewDto,
  TickLatestDto,
} from './marketTypes'

// ─────────────────────────────────────────────────────────────────────────────
// Backend paths — single source of truth (컴포넌트에 경로 하드코딩 금지)
// ─────────────────────────────────────────────────────────────────────────────

export const marketApiPaths = {
  chart: (marketCodeId: number) => `/api/v1/compose/chart/${marketCodeId}`,
  marketOverview: (marketCodeId: number) => `/api/v1/compose/market-overview/${marketCodeId}`,
  ticksLatest: '/api/v1/market/ticks/latest',
}

export interface ChartCompositionParams {
  marketCodeId: number
  interval: string
  indicatorType: string
  /** 윈도우 시작 — epoch ms (UTC) */
  fromTs: number
  /** 윈도우 끝 — epoch ms (UTC) */
  toTs: number
  /** mock 전용 — 캔들 베이스 가격 시드(자산 심볼). real 호출에는 사용되지 않음. */
  asset?: string
}

export interface MarketOverviewParams {
  marketCodeId: number
  base?: string
  indicatorMarketCodeIds?: number[]
  interval: string
  indicatorType: string
  /** mock 전용 시드 */
  asset?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Real backend calls
// ─────────────────────────────────────────────────────────────────────────────

export function fetchChartComposition(params: ChartCompositionParams): Promise<ChartCompositionDto> {
  return getJson<ChartCompositionDto>(marketApiPaths.chart(params.marketCodeId), {
    interval: params.interval,
    indicatorType: params.indicatorType,
    fromTs: params.fromTs,
    toTs: params.toTs,
  })
}

export function fetchMarketOverview(params: MarketOverviewParams): Promise<MarketOverviewDto> {
  return getJson<MarketOverviewDto>(marketApiPaths.marketOverview(params.marketCodeId), {
    base: params.base,
    indicatorMarketCodeIds: params.indicatorMarketCodeIds?.join(','),
    interval: params.interval,
    indicatorType: params.indicatorType,
  })
}

export function fetchTicksLatest(marketCodeIds: number[]): Promise<TickLatestDto[]> {
  return getJson<TickLatestDto[]>(marketApiPaths.ticksLatest, {
    marketCodeIds: marketCodeIds.join(','),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock builders — shape-identical to the real DTOs so mappers stay agnostic
// ─────────────────────────────────────────────────────────────────────────────

function buildMockIndicator(
  name: string,
  candles: ChartCandleDto[],
  period: number,
): IndicatorSeriesDto {
  const closes = candles.map((c) => Number(c.close))
  const points: IndicatorPointDto[] = []
  if (closes.length >= period) {
    const k = 2 / (period + 1)
    let ema = closes.slice(0, period).reduce((s, v) => s + v, 0) / period
    points.push({ ts: candles[period - 1].bucketOpenTs, value: String(Math.round(ema)) })
    for (let i = period; i < closes.length; i++) {
      ema = closes[i] * k + ema * (1 - k)
      points.push({ ts: candles[i].bucketOpenTs, value: String(Math.round(ema)) })
    }
  }
  return { name, indicatorType: 'EMA', points }
}

function buildMockComposition(params: { marketCodeId: number; interval: string; asset?: string }): ChartCompositionDto {
  const { candles, volumes } = getMockCandleData(params.asset ?? 'BTC', params.interval)
  // LwCandlePoint.time 은 초 단위 UTCTimestamp → DTO 규약(epoch ms)으로 되돌린다.
  const dtoCandles: ChartCandleDto[] = candles.map((c, i) => ({
    bucketOpenTs: (c.time as number) * 1000,
    open: String(c.open),
    high: String(c.high),
    low: String(c.low),
    close: String(c.close),
    volume: String(Math.round(volumes[i]?.value ?? 0)),
    marketCodeId: params.marketCodeId,
    interval: params.interval,
  }))
  return {
    marketCodeId: params.marketCodeId,
    interval: params.interval,
    candles: dtoCandles,
    indicators: [
      buildMockIndicator('EMA20', dtoCandles, 20),
      buildMockIndicator('EMA50', dtoCandles, 50),
    ],
    events: [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// mock ↔ real branch — single decision point (env.useMock)
// 훅/페이지는 아래 load* 함수만 사용한다.
// ─────────────────────────────────────────────────────────────────────────────

export function loadChartComposition(params: ChartCompositionParams): Promise<ChartCompositionDto> {
  if (env.useMock) {
    return Promise.resolve(
      buildMockComposition({
        marketCodeId: params.marketCodeId,
        interval: params.interval,
        asset: params.asset,
      }),
    )
  }
  return fetchChartComposition(params)
}

export function loadMarketOverview(params: MarketOverviewParams): Promise<MarketOverviewDto> {
  if (env.useMock) {
    return Promise.resolve({
      marketCodeId: params.marketCodeId,
      base: params.base,
      composition: buildMockComposition({
        marketCodeId: params.marketCodeId,
        interval: params.interval,
        asset: params.asset,
      }),
    })
  }
  return fetchMarketOverview(params)
}

export function loadTicksLatest(marketCodeIds: number[]): Promise<TickLatestDto[]> {
  if (env.useMock) {
    const ts = Date.now()
    return Promise.resolve(
      marketCodeIds.map((marketCodeId) => ({ marketCodeId, bid: '0', ask: '0', ts })),
    )
  }
  return fetchTicksLatest(marketCodeIds)
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy SVG-chart mock (CandlestickChart.tsx). 새 LwCandleChart 흐름은 위 load* 사용.
// ─────────────────────────────────────────────────────────────────────────────

export function getMockCandleSeries(): CandlePoint[] {
  return [
    { time: '09:00', open: 141.2, high: 142.7, low: 140.6, close: 142.1, volume: 74, premiumRate: 3.92 },
    { time: '10:00', open: 142.1, high: 143.2, low: 141.3, close: 142.4, volume: 68, premiumRate: 4.04 },
    { time: '11:00', open: 142.4, high: 144.1, low: 142.0, close: 143.8, volume: 82, premiumRate: 4.16 },
    { time: '12:00', open: 143.8, high: 144.0, low: 142.8, close: 143.2, volume: 51, premiumRate: 4.08 },
    { time: '13:00', open: 143.2, high: 145.5, low: 142.9, close: 145.1, volume: 92, premiumRate: 4.25 },
    { time: '14:00', open: 145.1, high: 146.0, low: 144.5, close: 145.6, volume: 88, premiumRate: 4.31 },
    { time: '15:00', open: 145.6, high: 146.8, low: 144.9, close: 146.3, volume: 96, premiumRate: 4.43 },
  ]
}
