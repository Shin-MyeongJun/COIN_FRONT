import { API_ENDPOINTS, SSE_EVENT_KEYS, type SseEventKey } from '../../../shared/api/endpoints'
import { subscribeStream, type StreamHandle, type StreamStatus } from './sseClient'

export const indicatorCloseStreamPath = API_ENDPOINTS.stream.indicatorsClose

/** `?type=` value → backend event name for the indicators/close stream. */
const INDICATOR_EVENT_BY_TYPE = {
  tick: SSE_EVENT_KEYS.tickIndicator,
  premium: SSE_EVENT_KEYS.premiumIndicator,
} as const

export type IndicatorStreamType = keyof typeof INDICATOR_EVENT_BY_TYPE

export function indicatorEventForType(type: IndicatorStreamType): SseEventKey {
  return INDICATOR_EVENT_BY_TYPE[type]
}

/** Subscribe to closed indicators (event: tick-indicator | premium-indicator). */
export function subscribeIndicatorCloseStream<T>(
  type: IndicatorStreamType,
  onData: (payload: T) => void,
  options: { onStatus?: (status: StreamStatus) => void } = {},
): StreamHandle {
  return subscribeStream<T>({
    path: indicatorCloseStreamPath,
    params: { type },
    event: indicatorEventForType(type),
    onData,
    onStatus: options.onStatus,
  })
}
