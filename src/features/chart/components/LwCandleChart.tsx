import {
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
} from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { useThemeStore } from '../../../shared/store/themeStore'
import type { IndicatorOverlayState, LiveCandleUpdate, LwCandlePoint, LwLinePoint, LwVolumePoint, OhlcvTooltip } from '../model/chartTypes'

type Props = {
  candles: LwCandlePoint[]
  volumes: LwVolumePoint[]
  height?: number
  overlays?: Partial<IndicatorOverlayState>
  /** Latest live candle update, applied imperatively via series.update(). */
  liveCandle?: LiveCandleUpdate | null
  onNearLeftEdge?: () => void
  /**
   * 백엔드 composition.indicators 에서 매핑한 EMA overlay.
   * 제공되면 그대로 사용하고, 없으면 candles 로 내부 계산(mock/legacy)으로 폴백.
   */
  indicators?: { ema20?: LwLinePoint[]; ema50?: LwLinePoint[] }
}

function calcEMA(data: LwCandlePoint[], period: number): LwLinePoint[] {
  if (data.length < period) return []
  const k = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period
  const result: LwLinePoint[] = [{ time: data[period - 1].time, value: Math.round(ema) }]
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k)
    result.push({ time: data[i].time, value: Math.round(ema) })
  }
  return result
}

function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function LwCandleChart({
  candles,
  volumes,
  height = 420,
  overlays,
  liveCandle,
  onNearLeftEdge,
  indicators,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null)
  const ema20SeriesRef = useRef<ISeriesApi<SeriesType> | null>(null)
  const ema50SeriesRef = useRef<ISeriesApi<SeriesType> | null>(null)
  const nearEdgeRef = useRef(false)

  const [tooltip, setTooltip] = useState<OhlcvTooltip | null>(null)
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  // Chart initialisation — only on mount / theme / height change
  useEffect(() => {
    if (!containerRef.current) return

    const bg = isDark ? '#161b22' : '#fbfdff'
    const textColor = isDark ? '#8b949e' : '#667789'
    const gridColor = isDark ? '#30363d' : '#e7edf4'

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: { background: { type: ColorType.Solid, color: bg }, textColor },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: gridColor, timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: gridColor },
    })
    chartRef.current = chart

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#0f8b5f',
      downColor: '#c94845',
      borderUpColor: '#0f8b5f',
      borderDownColor: '#c94845',
      wickUpColor: '#0f8b5f',
      wickDownColor: '#c94845',
    })
    candleSeriesRef.current = candleSeries

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    volumeSeriesRef.current = volumeSeries

    const ema20Series = chart.addSeries(LineSeries, {
      color: '#f0a500',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    ema20SeriesRef.current = ema20Series

    const ema50Series = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    ema50SeriesRef.current = ema50Series

    // OHLCV tooltip via crosshair
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) { setTooltip(null); return }
      const ohlc = param.seriesData.get(candleSeries)
      const vol = param.seriesData.get(volumeSeries)
      if (ohlc && 'open' in ohlc) {
        setTooltip({
          time: param.time as number,
          open: (ohlc as { open: number }).open,
          high: (ohlc as { high: number }).high,
          low: (ohlc as { low: number }).low,
          close: (ohlc as { close: number }).close,
          volume: vol && 'value' in vol ? (vol as { value: number }).value : 0,
        })
      }
    })

    // Infinite scroll — detect near left edge
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range !== null && range.from < 8 && !nearEdgeRef.current) {
        nearEdgeRef.current = true
        onNearLeftEdge?.()
        setTimeout(() => { nearEdgeRef.current = false }, 1000)
      }
    })

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    })
    ro.observe(containerRef.current)

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null }
  }, [isDark, height]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update series data when candles change
  useEffect(() => {
    candleSeriesRef.current?.setData(candles)
    volumeSeriesRef.current?.setData(volumes)

    const showEma20 = overlays?.ema20 ?? true
    const showEma50 = overlays?.ema50 ?? false

    // 백엔드 지표가 있으면 사용, 없으면 candles 로 내부 계산(mock/legacy 폴백).
    const ema20Data = indicators?.ema20 ?? calcEMA(candles, 20)
    const ema50Data = indicators?.ema50 ?? calcEMA(candles, 50)

    ema20SeriesRef.current?.setData(showEma20 ? ema20Data : [])
    ema50SeriesRef.current?.setData(showEma50 ? ema50Data : [])

    chartRef.current?.timeScale().fitContent()
  }, [candles, volumes, overlays, indicators])

  // Live update — apply the latest streamed candle to the series imperatively.
  // The source (mock simulation vs. real SSE) is owned by useLiveCandle.
  useEffect(() => {
    if (!liveCandle || !candleSeriesRef.current || !volumeSeriesRef.current) return
    candleSeriesRef.current.update(liveCandle.candle)
    volumeSeriesRef.current.update(liveCandle.volume)
  }, [liveCandle])

  const p = (n: number) => n.toLocaleString('ko-KR')

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {tooltip && (
        <div className="chart-ohlcv-tooltip" role="status" aria-live="polite">
          <span className="tooltip-time">{formatTime(tooltip.time)}</span>
          <span>O <b>{p(tooltip.open)}</b></span>
          <span>H <b className="text-positive">{p(tooltip.high)}</b></span>
          <span>L <b className="text-negative">{p(tooltip.low)}</b></span>
          <span>C <b style={{ color: tooltip.close >= tooltip.open ? '#0f8b5f' : '#c94845' }}>{p(tooltip.close)}</b></span>
          {tooltip.volume > 0 && <span>V <b>{(tooltip.volume / 1_000_000).toFixed(2)}M</b></span>}
        </div>
      )}
      <div
        ref={containerRef}
        className="lw-chart-container"
        role="img"
        aria-label="캔들스틱 차트"
        style={{ width: '100%', height }}
      />
    </div>
  )
}
