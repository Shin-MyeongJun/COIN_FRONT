import type { IndicatorOverlayState } from '../model/chartTypes'

export function IndicatorOverlayControls({
  overlays,
  onOverlayChange,
}: {
  overlays: IndicatorOverlayState
  onOverlayChange: (next: IndicatorOverlayState) => void
}) {
  return (
    <div className="overlay-controls">
      {Object.entries(overlays).map(([key, enabled]) => (
        <label key={key} className="toggle-field small">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onOverlayChange({ ...overlays, [key]: event.target.checked })}
          />
          <span>{key.replace(/([A-Z])/g, ' $1')}</span>
        </label>
      ))}
    </div>
  )
}
