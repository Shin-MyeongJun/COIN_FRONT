/**
 * Alerts SSE subscription (private — JWT-only stream).
 *
 * Why this isn't a plain `useSSE`:
 *   EventSource cannot send custom headers, so the backend authenticates the
 *   alerts stream via a per-connection token in the URL. We use the 1-use
 *   ticket from POST /api/v1/auth/sse-ticket as the primary credential
 *   (`?t=<ticket>`). The JWT `?access_token=<jwt>` fallback is supported by
 *   the backend but we deliberately avoid it: the JWT then sits in proxy
 *   access logs and the browser referrer for the lifetime of the token.
 *
 *   A ticket is consumed by the FIRST connection attempt. The default
 *   `useSSE` engine reconnects against the same URL, which would replay an
 *   already-consumed ticket. We therefore drive `connectSse` ourselves and
 *   re-mint a ticket every time the connection drops.
 *
 * Flow (single subscription lifecycle):
 *   1. Mount with `enabled=true` & authenticated user
 *      → fetch ticket → open EventSource with ?t=<ticket>
 *   2. On any error / close (network drop, ticket expiry detected by 401)
 *      → close the socket → fetch a fresh ticket → reopen with backoff
 *   3. Unmount → cancel in-flight ticket fetch + close socket
 */

import { useEffect, useRef, useState } from 'react'
import { fetchSseTicket } from '@/features/auth/api/authApi'
import { API_ENDPOINTS, SSE_EVENT_KEYS } from '@/shared/api/endpoints'
import { connectSse, type SseConnection } from '@/lib/sse'
import type { AlertFiringDto } from './alertTypes'

export type AlertsSseStatus =
  | 'idle'
  | 'fetching-ticket'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'unauthorized'

export interface UseAlertsStreamOptions {
  /** Called once per `alert-firing` event. */
  onFiring: (firing: AlertFiringDto) => void
  /** When false the stream stays closed (e.g. unauthenticated user). */
  enabled?: boolean
  /** Notified whenever the coarse status changes. */
  onStatusChange?: (status: AlertsSseStatus) => void
}

export interface UseAlertsStreamResult {
  status: AlertsSseStatus
}

const MIN_RECONNECT_MS = 1_000
const MAX_RECONNECT_MS = 30_000

export function useAlertsStream({
  onFiring,
  enabled = true,
  onStatusChange,
}: UseAlertsStreamOptions): UseAlertsStreamResult {
  const [status, setStatus] = useState<AlertsSseStatus>('idle')

  // Stable refs so changing callbacks don't tear down the live socket.
  const onFiringRef = useRef(onFiring)
  const onStatusChangeRef = useRef(onStatusChange)
  onFiringRef.current = onFiring
  onStatusChangeRef.current = onStatusChange

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      onStatusChangeRef.current?.('idle')
      return
    }

    let cancelled = false
    let conn: SseConnection | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0

    const update = (next: AlertsSseStatus) => {
      if (cancelled) return
      setStatus(next)
      onStatusChangeRef.current?.(next)
    }

    const scheduleReconnect = () => {
      if (cancelled) return
      attempt += 1
      const delay = Math.min(
        MAX_RECONNECT_MS,
        MIN_RECONNECT_MS * 2 ** Math.max(0, attempt - 1),
      )
      retryTimer = setTimeout(() => {
        retryTimer = null
        update('reconnecting')
        void start()
      }, delay)
    }

    const start = async () => {
      if (cancelled) return
      update('fetching-ticket')
      let ticket: string
      try {
        const res = await fetchSseTicket()
        ticket = res.ticket
      } catch (err) {
        if (cancelled) return
        // 401 → user lost session entirely; don't churn reconnects.
        // Anything else → treat as transient and retry with backoff.
        if (isUnauthorized(err)) {
          update('unauthorized')
          return
        }
        scheduleReconnect()
        return
      }

      if (cancelled) return
      update('connecting')

      conn = connectSse({
        path: API_ENDPOINTS.stream.alerts,
        params: { t: ticket },
        eventKeys: [SSE_EVENT_KEYS.alertFiring, SSE_EVENT_KEYS.connected],
        onEvent: {
          [SSE_EVENT_KEYS.alertFiring]: (payload) => {
            update('connected')
            onFiringRef.current(payload as AlertFiringDto)
          },
          [SSE_EVENT_KEYS.connected]: () => update('connected'),
        },
        onOpen: () => {
          attempt = 0
          update('connected')
        },
        onError: () => {
          // The built-in connectSse retry would reuse the (now-consumed)
          // ticket, so close and re-mint instead.
          if (conn !== null) {
            conn.close()
            conn = null
          }
          if (cancelled) return
          scheduleReconnect()
        },
        // Don't pauseOnHidden — alerts must keep firing in background tabs.
      })
    }

    void start()

    return () => {
      cancelled = true
      if (retryTimer !== null) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
      if (conn !== null) {
        conn.close()
        conn = null
      }
    }
  }, [enabled])

  return { status }
}

function isUnauthorized(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const status = (err as { status?: unknown }).status
  return status === 401 || status === 403
}
