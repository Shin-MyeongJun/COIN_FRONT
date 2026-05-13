import type { UTCTimestamp } from 'lightweight-charts'

// Legacy SVG chart type (CandlestickChart.tsx)
export interface CandlePoint {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  premiumRate: number
}

export interface LwCandlePoint {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

export interface LwVolumePoint {
  time: UTCTimestamp
  value: number
  color?: string
}

export interface LwLinePoint {
  time: UTCTimestamp
  value: number
}

export interface OhlcvTooltip {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IndicatorOverlayState {
  ema20: boolean
  ema50: boolean
  rsi: boolean
  bollinger: boolean
  premiumBand: boolean
  events: boolean
  news: boolean
}

export const defaultIndicatorOverlays: IndicatorOverlayState = {
  ema20: true,
  ema50: false,
  rsi: false,
  bollinger: false,
  premiumBand: false,
  events: true,
  news: false,
}

export const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
export type Interval = typeof INTERVALS[number]
