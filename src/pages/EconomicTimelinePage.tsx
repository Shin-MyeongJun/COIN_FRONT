import type { TimelineMarker } from '../features/chart/model/markerTypes'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'

export function EconomicTimelinePage({ markers }: { markers: TimelineMarker[] }) {
  return (
    <main className="workspace-panel timeline-page">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Standalone timeline</p>
          <h1>Economic events and market news</h1>
        </div>
        <span className="pair-pill">Chart-ready marker model</span>
      </div>
      <EconomicTimeline markers={markers} />
    </main>
  )
}
