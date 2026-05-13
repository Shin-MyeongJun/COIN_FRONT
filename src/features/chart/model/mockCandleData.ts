import type { UTCTimestamp } from 'lightweight-charts'
import type { LwCandlePoint, LwVolumePoint } from './chartTypes'

function seed(n: number, base: number, spread: number): number {
  return base + (((n * 9301 + 49297) % 233280) / 233280 - 0.5) * spread
}

export function generateMockCandles(
  basePrice: number,
  count: number,
  intervalSec: number,
  endTs = Math.floor(Date.now() / 1000),
): { candles: LwCandlePoint[]; volumes: LwVolumePoint[] } {
  const candles: LwCandlePoint[] = []
  const volumes: LwVolumePoint[] = []

  let price = basePrice

  for (let i = count - 1; i >= 0; i--) {
    const time = (endTs - i * intervalSec) as UTCTimestamp
    const change = seed(i + endTs, 0, basePrice * 0.02)
    const open = price
    const close = Math.max(price + change, basePrice * 0.5)
    const high = Math.max(open, close) + Math.abs(seed(i, 0, basePrice * 0.008))
    const low = Math.min(open, close) - Math.abs(seed(i + 1, 0, basePrice * 0.008))
    const volume = Math.abs(seed(i, 500_000, 400_000)) + 100_000

    candles.push({
      time,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
    })
    volumes.push({
      time,
      value: volume,
      color: close >= open ? 'rgba(15, 139, 95, 0.5)' : 'rgba(201, 72, 69, 0.5)',
    })

    price = close
  }

  return { candles, volumes }
}

const INTERVAL_SECS: Record<string, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
}

const BASE_PRICES: Record<string, number> = {
  BTC: 146_350_000,
  ETH: 7_817_000,
  XRP: 4_066,
  SOL: 242_500,
  DOGE: 423,
  ADA: 1_383,
  AVAX: 48_835,
}

export function getMockCandleData(
  asset: string,
  interval: string,
): { candles: LwCandlePoint[]; volumes: LwVolumePoint[] } {
  const base = BASE_PRICES[asset] ?? 100_000
  const sec = INTERVAL_SECS[interval] ?? 3600
  const count = interval === '1d' ? 180 : interval === '4h' ? 120 : 80
  return generateMockCandles(base, count, sec)
}

export function getMoreMockCandles(
  asset: string,
  interval: string,
  oldestTs: number,
  count = 60,
): { candles: LwCandlePoint[]; volumes: LwVolumePoint[] } {
  const base = BASE_PRICES[asset] ?? 100_000
  const sec = INTERVAL_SECS[interval] ?? 3600
  return generateMockCandles(base, count, sec, oldestTs - sec)
}

export function getIntervalSec(interval: string): number {
  return INTERVAL_SECS[interval] ?? 3600
}
