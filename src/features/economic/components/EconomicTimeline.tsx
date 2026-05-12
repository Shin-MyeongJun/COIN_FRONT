import type { TimelineMarker } from '../../chart/model/markerTypes'
import { EconomicEventMarker } from './EconomicEventMarker'

export function EconomicTimeline({ markers, compact = false }: { markers: TimelineMarker[]; compact?: boolean }) {
  return (
    <div className={compact ? 'timeline-list compact' : 'timeline-list'}>
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Timeline</p>
          <h2>Economic and news markers</h2>
        </div>
      </div>
      {markers.map((marker) => (
        <EconomicEventMarker key={marker.id} marker={marker} />
      ))}
    </div>
  )
}
