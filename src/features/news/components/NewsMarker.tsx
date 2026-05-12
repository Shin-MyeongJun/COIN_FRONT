import type { TimelineMarker } from '../../chart/model/markerTypes'

export function NewsMarker({ marker }: { marker: TimelineMarker }) {
  return (
    <article className={`timeline-item severity-${marker.severity.toLowerCase()}`}>
      <span>{marker.type}</span>
      <strong>{marker.title}</strong>
      <small>{marker.source}</small>
    </article>
  )
}
