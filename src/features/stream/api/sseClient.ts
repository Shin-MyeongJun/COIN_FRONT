/**
 * Imperative SSE subscription helper for the stream feature.
 *
 * Thin wrapper over the shared `connectSse` engine (src/lib/sse): subscribes to
 * a single named backend event and returns a handle whose `close()` tears the
 * connection (and its reconnect timer / visibility listener) down.
 *
 * React code should prefer `useSSE` (src/shared/lib/useSSE) — this exists for
 * non-component callers and as the primitive the per-event stream functions
 * (tickStream / premiumStream / candleStream / indicatorStream) build on.
 */

import { connectSse, type SseConnection, type SseQueryParams } from '../../../lib/sse'
import type { SseEventKey } from '../../../shared/api/endpoints'

export type StreamHandle = SseConnection
export type StreamStatus = 'connected' | 'reconnecting'

export type SubscribeStreamOptions<T> = {
  path: string
  params?: SseQueryParams
  event: SseEventKey
  onData: (payload: T) => void
  onStatus?: (status: StreamStatus) => void
  /** Suspend while the tab is hidden. Default: true. */
  pauseOnHidden?: boolean
}

export function subscribeStream<T>({
  path,
  params,
  event,
  onData,
  onStatus,
  pauseOnHidden = true,
}: SubscribeStreamOptions<T>): StreamHandle {
  return connectSse({
    path,
    params,
    eventKeys: [event],
    onEvent: {
      [event]: (payload: unknown) => {
        onStatus?.('connected')
        onData(payload as T)
      },
    },
    onOpen: () => onStatus?.('connected'),
    onReconnect: () => onStatus?.('connected'),
    onError: () => onStatus?.('reconnecting'),
    pauseOnHidden,
  })
}
