import type { IndicatorOverlayState } from '../model/chartTypes'

const LABELS: Record<keyof IndicatorOverlayState, string> = {
  ema20: 'EMA 20',
  ema50: 'EMA 50',
  rsi: 'RSI',
  bollinger: '볼린저 밴드',
  premiumBand: '프리미엄 밴드',
  events: '경제 이벤트',
  news: '뉴스',
}

export function IndicatorOverlayControls({
  overlays,
  onOverlayChange,
}: {
  overlays: IndicatorOverlayState
  onOverlayChange: (next: IndicatorOverlayState) => void
}) {
  return (
    <div className="overlay-controls">
      {(Object.keys(overlays) as (keyof IndicatorOverlayState)[]).map((key) => (
        <label key={key} className="toggle-field small">
          <input
            type="checkbox"
            checked={overlays[key]}
            onChange={(e) => onOverlayChange({ ...overlays, [key]: e.target.checked })}
          />
          <span>{LABELS[key]}</span>
        </label>
      ))}
    </div>
  )
}
