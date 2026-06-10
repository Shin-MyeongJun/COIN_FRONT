import { env } from '@/shared/config/env'
import type { SseEventKey } from '@/shared/api/endpoints'

export type SseEventHandler = (payload: unknown, raw: MessageEvent) => void

type SseQueryValue = string | number | boolean | undefined | null
export type SseQueryParams = Record<string, SseQueryValue>

export type SseReconnectInfo = {
  attempt: number
  lastEventId: string | null
}

export type SseConnectOptions = {
  path: string
  params?: SseQueryParams
  /** Named event keys to subscribe to (e.g. 'tick', 'premium-candle'). */
  eventKeys?: readonly SseEventKey[]
  /** Per-event-key handlers. Fires before onMessage when the key matches. */
  onEvent?: Partial<Record<SseEventKey, SseEventHandler>>
  /** Fallback for unnamed default 'message' events. */
  onMessage?: SseEventHandler
  /** Fires on initial open and on every successful reconnect. */
  onOpen?: (info: SseReconnectInfo) => void
  /** Fires on every successful reconnect (after onOpen). */
  onReconnect?: (info: SseReconnectInfo) => void
  /** Forwarded EventSource error event. */
  onError?: (event: Event) => void
  /**
   * Suspend the connection while the tab is hidden and resume (as a reconnect)
   * when it becomes visible again. Saves an idle socket on background tabs.
   * Fires onReconnect on resume. Default: false.
   */
  pauseOnHidden?: boolean
  /** Fires when the connection is suspended because the tab went hidden. */
  onPause?: () => void
  minBackoffMs?: number
  maxBackoffMs?: number
}

export type SseConnection = {
  close: () => void
  getLastEventId: () => string | null
  getReadyState: () => number
}

export function connectSse(options: SseConnectOptions): SseConnection {
  const {
    path,
    params,
    eventKeys,
    onEvent,
    onMessage,
    onOpen,
    onReconnect,
    onError,
    pauseOnHidden = false,
    onPause,
    minBackoffMs = 1000,
    maxBackoffMs = 30000,
  } = options

  const url = buildSseUrl(path, params)

  let source: EventSource | null = null
  let attempts = 0
  let lastEventId: string | null = null
  let closed = false
  let paused = false
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const parsePayload = (raw: MessageEvent): unknown => {
    if (typeof raw.data !== 'string') return raw.data
    try {
      return JSON.parse(raw.data)
    } catch {
      return raw.data
    }
  }

  const dispatch = (key: SseEventKey | null, raw: MessageEvent) => {
    if (raw.lastEventId !== '' && raw.lastEventId !== undefined) {
      lastEventId = raw.lastEventId
    }
    const payload = parsePayload(raw)
    if (key !== null && onEvent && onEvent[key]) {
      onEvent[key]?.(payload, raw)
      return
    }
    onMessage?.(payload, raw)
  }

  const open = (isReconnect: boolean) => {
    if (closed || paused) return
    const es = new EventSource(url)
    source = es

    es.onopen = () => {
      const info: SseReconnectInfo = { attempt: attempts, lastEventId }
      onOpen?.(info)
      if (isReconnect) onReconnect?.(info)
      attempts = 0
    }

    es.onmessage = (e) => dispatch(null, e)

    if (eventKeys && eventKeys.length > 0) {
      for (const key of eventKeys) {
        es.addEventListener(key, (e) => dispatch(key, e as MessageEvent))
      }
    }

    es.onerror = (e) => {
      onError?.(e)
      if (closed) return
      // Browser auto-reconnects while readyState === CONNECTING.
      // Only intervene when the stream is fully closed (permanent failure).
      if (es.readyState === EventSource.CLOSED) {
        es.close()
        source = null
        attempts += 1
        const delay = Math.min(
          maxBackoffMs,
          minBackoffMs * 2 ** Math.max(0, attempts - 1),
        )
        reconnectTimer = setTimeout(() => open(true), delay)
      }
    }
  }

  const handleVisibility = () => {
    if (closed) return
    if (document.hidden) {
      // Suspend: drop the socket and any pending retry until we're visible again.
      paused = true
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      if (source !== null) {
        source.close()
        source = null
      }
      onPause?.()
    } else if (paused) {
      paused = false
      attempts = 0
      open(true)
    }
  }

  const useVisibility = pauseOnHidden && typeof document !== 'undefined'
  if (useVisibility) {
    document.addEventListener('visibilitychange', handleVisibility)
  }

  open(false)

  return {
    close: () => {
      closed = true
      if (useVisibility) {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      if (source !== null) {
        source.close()
        source = null
      }
    },
    getLastEventId: () => lastEventId,
    getReadyState: () => source?.readyState ?? EventSource.CLOSED,
  }
}

function buildSseUrl(path: string, params?: SseQueryParams): string {
  const url = new URL(path, env.sseBaseUrl)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}
