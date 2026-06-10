import { useTimelineMarkers } from '../features/economic/api/useEconomicQueries'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'

export function EconomicTimelinePage() {
  const { data: markers, isPending, isError } = useTimelineMarkers()

  return (
    <main className="workspace-panel timeline-page">
      <div className="panel-header">
        <div>
          <p className="eyebrow">이벤트 타임라인</p>
          <h1>경제 이벤트와 시장 뉴스</h1>
        </div>
        <span className="pair-pill">차트 오버레이용 마커</span>
      </div>

      {isPending && <p className="muted">타임라인을 불러오는 중…</p>}
      {isError && <p className="muted">타임라인을 불러오지 못했습니다.</p>}
      {!isPending && !isError && markers.length === 0 && (
        <p className="muted">표시할 경제 이벤트가 없습니다.</p>
      )}
      {!isPending && !isError && markers.length > 0 && <EconomicTimeline markers={markers} />}
    </main>
  )
}
