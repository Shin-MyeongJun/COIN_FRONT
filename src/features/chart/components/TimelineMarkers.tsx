import type { TimelineMarker } from '../model/markerTypes'

export function TimelineMarkers({
  markers,
  xStep,
  height,
}: {
  markers: TimelineMarker[]
  xStep: number
  height: number
}) {
  return (
    <>
      {markers.map((marker, index) => (
        <g key={marker.id} className="event-marker">
          <line x1={xStep * (index + 2)} x2={xStep * (index + 2)} y1="26" y2={height - 28} />
          <circle cx={xStep * (index + 2)} cy="26" r="5" />
        </g>
      ))}
    </>
  )
}
