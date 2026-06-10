import { API_ENDPOINTS, SSE_EVENT_KEYS } from '../../../shared/api/endpoints'
import { subscribeStream, type StreamHandle, type StreamStatus } from './sseClient'

export const premiumStreamPath = API_ENDPOINTS.stream.premium
export const premiumEvent = SSE_EVENT_KEYS.premium

/** Subscribe to the public `premium` stream (event: premium). */
export function subscribePremiumStream<T>(
  onData: (payload: T) => void,
  options: { onStatus?: (status: StreamStatus) => void } = {},
): StreamHandle {
  return subscribeStream<T>({
    path: premiumStreamPath,
    event: premiumEvent,
    onData,
    onStatus: options.onStatus,
  })
}
