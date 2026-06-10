/**
 * Live candle source for the detail chart.
 *
 * Returns the latest {candle, volume} update (new identity each tick) which the
 * chart applies imperatively via series.update(). Two sources, chosen by env:
 *   - mock mode  → a 2s local simulation nudging the last bar (no backend)
 *   - live mode  → /api/v1/stream/candles/close (event: tick-candle)
 *
 * Either way the global stream status store is marked so the StreamStatusPill
 * reflects activity.
 */

import { useEffect, useRef, useState } from 'react'
import type { UTCTimestamp } from 'lightweight-charts'
import { env } from '../../../shared/config/env'
import { useSSE } from '../../../shared/lib/useSSE'
import {
  candleCloseStreamPath,
  candleEventForType,
  type CandleStreamType,
} from '../../stream/api/candleStream'
import { useStreamStore } from '../../stream/model/streamStore'
import type { CandleCloseEvent } from '../../stream/model/streamTypes'
import type { LiveCandleUpdate, LwCandlePoint, LwVolumePoint } from './chartTypes'

const UP_COLOR = 'rgba(15, 139, 95, 0.5)'
const DOWN_COLOR = 'rgba(201, 72, 69, 0.5)'

function toNumber(value: number | string | undefined): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function mapCandleCloseEvent(ev: CandleCloseEvent): LiveCandleUpdate | null {
  const rawTime = ev.openTime ?? ev.ts
  if (rawTime === undefined) return null
  const time = Math.floor(rawTime / 1000) as UTCTimestamp
  const open = toNumber(ev.open)
  const close = toNumber(ev.close)
  return {
    candle: {
      time,
      open,
      high: toNumber(ev.high),
      low: toNumber(ev.low),
      close,
    },
    volume: {
      time,
      value: toNumber(ev.volume),
      color: close >= open ? UP_COLOR : DOWN_COLOR,
    },
  }
}

type UseLiveCandleArgs = {
  asset: string
  type?: CandleStreamType
  candles: LwCandlePoint[]
}

export function useLiveCandle({
  asset,
  type = 'tick',
  candles,
}: UseLiveCandleArgs): LiveCandleUpdate | null {
  const [update, setUpdate] = useState<LiveCandleUpdate | null>(null)
  const markEvent = useStreamStore((s) => s.markEvent)

  const useMock = env.useMock

  // Latest candles kept in a ref so the mock interval reads fresh data without
  // re-subscribing on every render.
  const candlesRef = useRef(candles)
  candlesRef.current = candles

  // ── Live SSE source ────────────────────────────────────────────────────────
  useSSE<CandleCloseEvent>({
    path: candleCloseStreamPath,
    params: { type },
    event: candleEventForType(type),
    enabled: !useMock,
    onMessage: (ev) => {
      const symbol = ev.symbol
      // Drop events that clearly belong to a different asset.
      if (symbol && asset && !symbol.toUpperCase().includes(asset.toUpperCase())) return
      const mapped = mapCandleCloseEvent(ev)
      if (mapped) {
        markEvent()
        setUpdate(mapped)
      }
    },
  })

  // ── Mock simulation source ──────────────────────────────────────────────────
  useEffect(() => {
    if (!useMock) return
    const id = setInterval(() => {
      const data = candlesRef.current
      if (data.length === 0) return
      const last = data[data.length - 1]
      const delta = (Math.random() - 0.5) * last.close * 0.002
      const newClose = Math.max(1, Math.round(last.close + delta))
      const candle: LwCandlePoint = {
        time: last.time,
        open: last.open,
        high: Math.max(last.high, newClose),
        low: Math.min(last.low, newClose),
        close: newClose,
      }
      const volume: LwVolumePoint = {
        time: last.time,
        value: Math.abs((Math.random() - 0.5) * 600_000) + 100_000,
        color: newClose >= last.open ? UP_COLOR : DOWN_COLOR,
      }
      markEvent()
      setUpdate({ candle, volume })
    }, 2000)
    return () => clearInterval(id)
  }, [useMock, markEvent])

  return update
}
