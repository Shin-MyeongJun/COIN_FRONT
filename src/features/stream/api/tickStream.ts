import { API_ENDPOINTS, SSE_EVENT_KEYS } from '../../../shared/api/endpoints'
import { subscribeStream, type StreamHandle, type StreamStatus } from './sseClient'

export const tickStreamPath = API_ENDPOINTS.stream.ticks
export const tickEvent = SSE_EVENT_KEYS.tick

/** Subscribe to the public `tick` stream (event: tick). */
export function subscribeTickStream<T>(
  onData: (payload: T) => void,
  options: { marketCodeId?: number; onStatus?: (status: StreamStatus) => void } = {},
): StreamHandle {
  return subscribeStream<T>({
    path: tickStreamPath,
    params: { marketCodeId: options.marketCodeId },
    event: tickEvent,
    onData,
    onStatus: options.onStatus,
  })
}
