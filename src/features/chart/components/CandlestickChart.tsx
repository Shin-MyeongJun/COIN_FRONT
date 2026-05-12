import type { CandlePoint } from '../model/chartTypes'
import type { TimelineMarker } from '../model/markerTypes'
import { TimelineMarkers } from './TimelineMarkers'

export function CandlestickChart({
  candles,
  compact = false,
  markers,
}: {
  candles: CandlePoint[]
  compact?: boolean
  markers: TimelineMarker[]
}) {
  const width = compact ? 420 : 980
  const height = compact ? 260 : 390
  const minLow = Math.min(...candles.map((candle) => candle.low))
  const maxHigh = Math.max(...candles.map((candle) => candle.high))
  const range = maxHigh - minLow
  const candleWidth = compact ? 18 : 26
  const xStep = width / (candles.length + 1)

  function y(price: number) {
    return 32 + (1 - (price - minLow) / range) * (height - 92)
  }

  const premiumPoints = candles
    .map((candle, index) => {
      const x = xStep * (index + 1)
      const premiumY = height - 42 - ((candle.premiumRate - 3.8) / 0.7) * 48
      return `${x},${premiumY}`
    })
    .join(' ')

  return (
    <div className="chart-frame">
      <svg viewBox={`0 0 ${width} ${height}`} className="candle-chart" role="img" aria-label="Candlestick chart">
        <rect x="0" y="0" width={width} height={height} rx="8" />
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="20" x2={width - 20} y1={48 + line * 64} y2={48 + line * 64} className="grid-line" />
        ))}
        {candles.map((candle, index) => {
          const x = xStep * (index + 1)
          const rising = candle.close >= candle.open
          const bodyTop = Math.min(y(candle.open), y(candle.close))
          const bodyHeight = Math.max(Math.abs(y(candle.open) - y(candle.close)), 4)

          return (
            <g key={candle.time}>
              <line x1={x} x2={x} y1={y(candle.high)} y2={y(candle.low)} className={rising ? 'wick-up' : 'wick-down'} />
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                rx="3"
                className={rising ? 'candle-up' : 'candle-down'}
              />
              <rect
                x={x - candleWidth / 2}
                y={height - 28 - candle.volume}
                width={candleWidth}
                height={candle.volume}
                rx="2"
                className="volume-bar"
              />
              <text x={x} y={height - 8}>{candle.time}</text>
            </g>
          )
        })}
        <polyline points={premiumPoints} className="premium-line" />
        <TimelineMarkers markers={markers} xStep={xStep} height={height} />
      </svg>
    </div>
  )
}
