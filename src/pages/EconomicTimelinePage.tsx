import { getMockTimelineMarkers } from '../features/economic/api/economicApi'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'

const timelineMarkers = getMockTimelineMarkers()

export function EconomicTimelinePage() {
  return (
    <main className="workspace-panel timeline-page">
      <div className="panel-header">
        <div>
          <p className="eyebrow">이벤트 타임라인</p>
          <h1>경제 이벤트와 시장 뉴스</h1>
        </div>
        <span className="pair-pill">차트 오버레이용 마커</span>
      </div>
      <EconomicTimeline markers={timelineMarkers} />
    </main>
  )
}
