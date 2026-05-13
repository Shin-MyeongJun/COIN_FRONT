import type { TimelineMarker } from '../../chart/model/markerTypes'
import { EconomicEventMarker } from './EconomicEventMarker'

export function EconomicTimeline({ markers, compact = false }: { markers: TimelineMarker[]; compact?: boolean }) {
  return (
    <div className={compact ? 'timeline-list compact' : 'timeline-list'}>
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">타임라인</p>
          <h2>경제 이벤트와 뉴스 마커</h2>
        </div>
      </div>
      {markers.map((marker) => (
        <EconomicEventMarker key={marker.id} marker={marker} />
      ))}
    </div>
  )
}
