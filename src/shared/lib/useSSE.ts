/**
 * React binding over the low-level `connectSse` engine (src/lib/sse).
 *
 * Owns the connection lifecycle for a single named SSE event:
 *   - opens on mount (when `enabled`), closes on unmount
 *   - one EventSource per active subscription — no duplicates across renders
 *   - suspends while the tab is hidden, resumes (reconnect) when visible
 *   - surfaces a coarse connection status for UI ("연결 상태") badges
 *
 * Components MUST go through this hook (or a feature model hook built on it)
 * instead of constructing `new EventSource` directly.
 */

import { useEffect, useRef, useState } from 'react'
import { connectSse, type SseQueryParams } from '../../lib/sse'
import type { SseEventKey } from '../api/endpoints'

export type SseStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting'

export type UseSseOptions<T> = {
  /** Relative SSE path, e.g. '/api/v1/stream/ticks'. */
  path: string
  /** Query params (marketCodeId, type, …). */
  params?: SseQueryParams
  /** Named backend event to listen for (e.g. 'tick', 'tick-candle'). */
  event: SseEventKey
  /** Called with the parsed JSON payload for each event. */
  onMessage: (payload: T) => void
  /** Notified whenever the connection status changes. */
  onStatusChange?: (status: SseStatus) => void
  /** When false, no connection is opened. Default: true. */
  enabled?: boolean
}

export function useSSE<T>({
  path,
  params,
  event,
  onMessage,
  onStatusChange,
  enabled = true,
}: UseSseOptions<T>): { status: SseStatus } {
  const [status, setStatus] = useState<SseStatus>('idle')

  // Keep the latest callbacks in refs so identity churn never forces a
  // reconnect — only path/params/event/enabled changes do.
  const onMessageRef = useRef(onMessage)
  const onStatusChangeRef = useRef(onStatusChange)
  onMessageRef.current = onMessage
  onStatusChangeRef.current = onStatusChange

  const paramsKey = params ? JSON.stringify(params) : ''

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      return
    }

    const update = (next: SseStatus) => {
      setStatus(next)
      onStatusChangeRef.current?.(next)
    }

    update('connecting')

    const conn = connectSse({
      path,
      params,
      eventKeys: [event],
      onEvent: {
        [event]: (payload: unknown) => {
          update('connected')
          onMessageRef.current(payload as T)
        },
      },
      onOpen: () => update('connected'),
      onReconnect: () => update('connected'),
      onError: () => update('reconnecting'),
      pauseOnHidden: true,
    })

    return () => conn.close()
    // paramsKey captures params value; params object identity is intentionally ignored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, paramsKey, event, enabled])

  return { status }
}
