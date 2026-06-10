import { useNavigate } from 'react-router-dom'
import { AlertPanel } from '../../alert/components/AlertPanel'
import { WatchlistPanel } from '../../watchlist/components/WatchlistPanel'

// NOTE: 한 카드 안에 상/하 두 섹션을 컴포지션. WatchlistPanel/AlertPanel의 props는 변경하지 않음.
export function WatchlistAlertPanel() {
  const navigate = useNavigate()

  return (
    <div className="watchlist-alert-card">
      <section className="watchlist-alert-section" aria-label="관심 목록">
        <header className="watchlist-alert-section-header">
          <div>
            <h3>📌 관심 목록</h3>
            <p>실시간 김프 모니터링</p>
          </div>
        </header>
        <WatchlistPanel />
      </section>

      <div className="watchlist-alert-divider" role="separator" aria-hidden="true" />

      <section className="watchlist-alert-section" aria-label="알람 발화 이력">
        <header className="watchlist-alert-section-header">
          <div>
            <h3>🔔 알람 발화 이력</h3>
            <p>최근 5건</p>
          </div>
          <button type="button" onClick={() => navigate('/alerts')}>
            전체 보기
          </button>
        </header>
        <AlertPanel />
      </section>
    </div>
  )
}
