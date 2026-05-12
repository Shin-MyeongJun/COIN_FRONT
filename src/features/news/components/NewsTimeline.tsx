import type { TimelineMarker } from '../../chart/model/markerTypes'
import { NewsMarker } from './NewsMarker'

export function NewsTimeline({ markers }: { markers: TimelineMarker[] }) {
  return (
    <div className="timeline-list">
      {markers.map((marker) => (
        <NewsMarker key={marker.id} marker={marker} />
      ))}
    </div>
  )
}
