import { formatClock } from '../../../shared/lib/formatTime'
import type { TimelineMarker } from '../../chart/model/markerTypes'

const markerTypeLabels: Record<TimelineMarker['type'], string> = {
  ECONOMIC: '경제',
  EXCHANGE: '거래소',
  NEWS: '뉴스',
  REGULATION: '규제',
  SYSTEM: '시스템',
}

export function EconomicEventMarker({ marker }: { marker: TimelineMarker }) {
  return (
    <article className={`timeline-item severity-${marker.severity.toLowerCase()}`}>
      <span>{markerTypeLabels[marker.type]}</span>
      <strong>{marker.title}</strong>
      <small>{formatClock(marker.timestamp)} · {marker.source}</small>
    </article>
  )
}
