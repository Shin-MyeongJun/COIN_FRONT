/**
 * Live premium rows for the dashboard table.
 *
 * Evolves a working copy of the base premium pairs and reports which rows just
 * changed (for the flash highlight). Two sources, chosen by env:
 *   - mock mode → a 2s local simulation nudging a random row (no backend)
 *   - live mode → /api/v1/stream/premium (event: premium), merged by symbol
 *
 * Marks the global stream status store so the StreamStatusPill reflects activity.
 */

import { useEffect, useRef, useState } from 'react'
import { env } from '../../../shared/config/env'
import { useSSE } from '../../../shared/lib/useSSE'
import type { PremiumStreamEvent } from '../api/premiumTypes'
import { premiumStreamPath, premiumEvent } from '../../stream/api/premiumStream'
import { useStreamStore } from '../../stream/model/streamStore'
import { premiumPairKey, type PremiumPairView } from './premiumViewTypes'

const FLASH_MS = 1200
const SPARKLINE_MAX = 7

function toNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function withUpdatedRate(pair: PremiumPairView, buy: number, sell: number, ts: number): PremiumPairView {
  return {
    ...pair,
    buyPremiumRate: buy,
    sellPremiumRate: sell,
    lastUpdatedAt: ts,
    sparkline: [...pair.sparkline, buy].slice(-SPARKLINE_MAX),
  }
}

export function usePremiumLive(basePairs: PremiumPairView[]): {
  pairs: PremiumPairView[]
  changedKeys: ReadonlySet<string>
} {
  const [pairs, setPairs] = useState<PremiumPairView[]>(basePairs)
  const [changedKeys, setChangedKeys] = useState<ReadonlySet<string>>(() => new Set())
  const markEvent = useStreamStore((s) => s.markEvent)
  const setStatus = useStreamStore((s) => s.setStatus)

  const useMock = env.useMock
  const pairsRef = useRef(pairs)
  pairsRef.current = pairs
  const flashTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  // Re-seed when the base set changes (e.g. different mock fixture).
  useEffect(() => {
    setPairs(basePairs)
  }, [basePairs])

  const flash = (keys: string[]) => {
    if (keys.length === 0) return
    setChangedKeys((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => next.add(k))
      return next
    })
    for (const key of keys) {
      const existing = flashTimers.current.get(key)
      if (existing) clearTimeout(existing)
      flashTimers.current.set(
        key,
        setTimeout(() => {
          flashTimers.current.delete(key)
          setChangedKeys((prev) => {
            if (!prev.has(key)) return prev
            const next = new Set(prev)
            next.delete(key)
            return next
          })
        }, FLASH_MS),
      )
    }
  }

  // ── Live SSE source ────────────────────────────────────────────────────────
  useSSE<PremiumStreamEvent>({
    path: premiumStreamPath,
    event: premiumEvent,
    enabled: !useMock,
    onMessage: (ev) => {
      const symbol = (ev.symbol ?? ev.base ?? '').toUpperCase()
      if (symbol === '') return
      const rate = toNumber(ev.premiumRate)
      const buy = toNumber(ev.buyPremiumRate) ?? rate
      const sell = toNumber(ev.sellPremiumRate) ?? rate
      if (buy === undefined && sell === undefined) return
      const ts = ev.ts ?? Date.now()

      const changed: string[] = []
      setPairs((prev) =>
        prev.map((pair) => {
          if (!symbol.includes(pair.asset.toUpperCase())) return pair
          changed.push(premiumPairKey(pair))
          return withUpdatedRate(pair, buy ?? pair.buyPremiumRate, sell ?? pair.sellPremiumRate, ts)
        }),
      )
      markEvent()
      flash(changed)
    },
  })

  // ── Mock simulation source ──────────────────────────────────────────────────
  useEffect(() => {
    if (!useMock) return
    setStatus('connected')
    const id = setInterval(() => {
      const current = pairsRef.current
      if (current.length === 0) return
      const index = Math.floor(Math.random() * current.length)
      const target = current[index]
      const drift = (Math.random() - 0.5) * 0.3
      const buy = Math.max(0, Number((target.buyPremiumRate + drift).toFixed(2)))
      const sell = Math.max(buy, Number((target.sellPremiumRate + drift).toFixed(2)))
      const key = premiumPairKey(target)
      setPairs((prev) =>
        prev.map((pair, i) => (i === index ? withUpdatedRate(pair, buy, sell, Date.now()) : pair)),
      )
      markEvent()
      flash([key])
    }, 2000)
    return () => clearInterval(id)
  }, [useMock, markEvent, setStatus])

  // Clear pending flash timers on unmount.
  useEffect(() => {
    const timers = flashTimers.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
    }
  }, [])

  return { pairs, changedKeys }
}
