export type StreamStatus = 'connected' | 'reconnecting' | 'disconnected' | 'stale'

export interface StreamState {
  status: StreamStatus
  lastEventAt?: number
}

/**
 * Closed-candle payload from /api/v1/stream/candles/close
 * (events: tick-candle | premium-candle | premium-detail-candle).
 *
 * Per backend contract: time = epoch ms (number); OHLCV amounts are string
 * (BigDecimal). Fields are loosely typed because the raw event is untrusted.
 */
export interface CandleCloseEvent {
  marketCodeId?: number
  symbol?: string
  openTime?: number
  ts?: number
  open?: number | string
  high?: number | string
  low?: number | string
  close?: number | string
  volume?: number | string
}
