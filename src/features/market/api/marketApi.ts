import { getJson } from '../../../shared/api/httpClient'
import type { CandlePoint } from '../../chart/model/chartTypes'
import type { ChartCompositionDto } from './marketTypes'

export const marketApiPaths = {
  chart: (marketCodeId: number) => `/api/v1/compose/chart/${marketCodeId}`,
  marketOverview: (marketCodeId: number) => `/api/v1/compose/market-overview/${marketCodeId}`,
  ticksLatest: '/api/v1/market/ticks/latest',
}

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

export function fetchChartComposition(params: {
  marketCodeId: number
  interval: string
  indicatorType: string
  fromTs: number
  toTs: number
}) {
  return getJson<ChartCompositionDto>(marketApiPaths.chart(params.marketCodeId), {
    interval: params.interval,
    indicatorType: params.indicatorType,
    fromTs: params.fromTs,
    toTs: params.toTs,
  })
}
