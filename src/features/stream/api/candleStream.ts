import { API_ENDPOINTS, SSE_EVENT_KEYS, type SseEventKey } from '../../../shared/api/endpoints'
import { subscribeStream, type StreamHandle, type StreamStatus } from './sseClient'

export const candleCloseStreamPath = API_ENDPOINTS.stream.candlesClose

/** `?type=` value → backend event name for the candles/close stream. */
const CANDLE_EVENT_BY_TYPE = {
  tick: SSE_EVENT_KEYS.tickCandle,
  premium: SSE_EVENT_KEYS.premiumCandle,
} as const

export type CandleStreamType = keyof typeof CANDLE_EVENT_BY_TYPE

export function candleEventForType(type: CandleStreamType): SseEventKey {
  return CANDLE_EVENT_BY_TYPE[type]
}

/** Subscribe to closed candles (event: tick-candle | premium-candle). */
export function subscribeCandleCloseStream<T>(
  type: CandleStreamType,
  onData: (payload: T) => void,
  options: { onStatus?: (status: StreamStatus) => void } = {},
): StreamHandle {
  return subscribeStream<T>({
    path: candleCloseStreamPath,
    params: { type },
    event: candleEventForType(type),
    onData,
    onStatus: options.onStatus,
  })
}
