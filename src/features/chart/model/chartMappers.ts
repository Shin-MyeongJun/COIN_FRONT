import type { UTCTimestamp } from 'lightweight-charts'
import type {
  ChartCandleDto,
  ChartCompositionDto,
  IndicatorSeriesDto,
} from '../../market/api/marketTypes'
import type { LwCandlePoint, LwLinePoint, LwVolumePoint } from './chartTypes'

/**
 * ChartCompositionDto(백엔드) → lightweight-charts ViewModel 변환.
 *
 * 핵심 주의점:
 *   1) 시간축: 백엔드는 epoch **milliseconds**, lightweight-charts 는 **seconds**
 *      단위의 UTCTimestamp 를 요구한다. 잘못 변환하면 캔들이 1970년 근처로 몰리거나
 *      축이 깨지므로 toUtcSeconds() 한 곳에서만 변환한다.
 *   2) OHLC/volume 은 BigDecimal string → Number(표시·차트 전용) 변환.
 *   3) lightweight-charts 는 시간 오름차순 + 중복 timestamp 없음을 강제하므로
 *      매퍼에서 정렬·중복제거를 보장한다.
 */

const UP_COLOR = 'rgba(15, 139, 95, 0.5)'
const DOWN_COLOR = 'rgba(201, 72, 69, 0.5)'

/** epoch ms (UTC) → UTCTimestamp(초). 음수/NaN 방지로 floor 사용. */
export function toUtcSeconds(epochMs: number): UTCTimestamp {
  return Math.floor(epochMs / 1000) as UTCTimestamp
}

/** 시간 오름차순 정렬 후 동일 timestamp 는 마지막 값만 남긴다. */
function sortDedupe<T extends { time: UTCTimestamp }>(points: T[]): T[] {
  const sorted = [...points].sort((a, b) => (a.time as number) - (b.time as number))
  const result: T[] = []
  for (const p of sorted) {
    const last = result[result.length - 1]
    if (last && last.time === p.time) {
      result[result.length - 1] = p
    } else {
      result.push(p)
    }
  }
  return result
}

export function toLwCandles(candles: ChartCandleDto[]): LwCandlePoint[] {
  return sortDedupe(
    candles.map((c) => ({
      time: toUtcSeconds(c.bucketOpenTs),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
    })),
  )
}

export function toLwVolumes(candles: ChartCandleDto[]): LwVolumePoint[] {
  return sortDedupe(
    candles.map((c) => ({
      time: toUtcSeconds(c.bucketOpenTs),
      value: Number(c.volume ?? '0'),
      color: Number(c.close) >= Number(c.open) ? UP_COLOR : DOWN_COLOR,
    })),
  )
}

export function toLwLine(series: IndicatorSeriesDto | undefined): LwLinePoint[] {
  if (!series) return []
  return sortDedupe(
    series.points.map((p) => ({
      time: toUtcSeconds(p.ts),
      value: Number(p.value),
    })),
  )
}

/** indicators[] 에서 이름으로 한 종류를 찾는다(대소문자 무시). */
export function findIndicator(
  indicators: IndicatorSeriesDto[] | undefined,
  name: string,
): IndicatorSeriesDto | undefined {
  if (!indicators) return undefined
  const lowered = name.toLowerCase()
  return indicators.find((i) => i.name?.toLowerCase() === lowered)
}

export interface ChartViewModel {
  candles: LwCandlePoint[]
  volumes: LwVolumePoint[]
  /** composition.indicators 에서 매핑한 EMA overlay (없으면 빈 배열) */
  ema20: LwLinePoint[]
  ema50: LwLinePoint[]
}

export function mapChartComposition(dto: ChartCompositionDto | undefined): ChartViewModel {
  const candles = dto?.candles ?? []
  return {
    candles: toLwCandles(candles),
    volumes: toLwVolumes(candles),
    ema20: toLwLine(findIndicator(dto?.indicators, 'EMA20')),
    ema50: toLwLine(findIndicator(dto?.indicators, 'EMA50')),
  }
}
