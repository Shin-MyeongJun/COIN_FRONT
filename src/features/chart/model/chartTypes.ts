export interface CandlePoint {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  premiumRate: number
}

export interface IndicatorOverlayState {
  rsi: boolean
  macd: boolean
  bollinger: boolean
  premiumBand: boolean
  events: boolean
  news: boolean
}

export const defaultIndicatorOverlays: IndicatorOverlayState = {
  rsi: true,
  macd: false,
  bollinger: true,
  premiumBand: true,
  events: true,
  news: true,
}
