import { formatClock } from '../../../shared/lib/formatTime'
import type { TimelineMarker } from '../../chart/model/markerTypes'

export function EconomicEventMarker({ marker }: { marker: TimelineMarker }) {
  return (
    <article className={`timeline-item severity-${marker.severity.toLowerCase()}`}>
      <span>{marker.type}</span>
      <strong>{marker.title}</strong>
      <small>{formatClock(marker.timestamp)} · {marker.source}</small>
    </article>
  )
}
