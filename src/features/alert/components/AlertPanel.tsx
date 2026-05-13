import { useNavigate } from 'react-router-dom'

type MockFiring = {
  id: number
  ruleName: string
  condition: string
  firedAt: number
  value: string
}

const MOCK_FIRINGS: MockFiring[] = [
  { id: 1, ruleName: 'BTC 김프 폭발', condition: '> 5%', firedAt: Date.now() - 180_000, value: '5.21%' },
  { id: 2, ruleName: 'ETH 매도 프리미엄', condition: '> 4.5%', firedAt: Date.now() - 600_000, value: '4.71%' },
  { id: 3, ruleName: 'SOL 김프 급등', condition: '> 4%', firedAt: Date.now() - 1_800_000, value: '4.03%' },
  { id: 4, ruleName: 'XRP 프리미엄 하락', condition: '< 2%', firedAt: Date.now() - 3_600_000, value: '1.88%' },
  { id: 5, ruleName: 'DOGE 급등 감지', condition: '> 3.5%', firedAt: Date.now() - 7_200_000, value: '3.62%' },
]

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return `${Math.floor(diff / 86_400_000)}일 전`
}

export function AlertPanel() {
  const navigate = useNavigate()

  return (
    <div className="alert-panel">
      <div className="alert-firing-list">
        {MOCK_FIRINGS.map((f) => (
          <div key={f.id} className="alert-firing-row">
            <span className="alert-dot" aria-hidden="true" />
            <span className="alert-info">
              <strong>{f.ruleName}</strong>
              <small>{f.condition} → 현재 <span className="text-positive">{f.value}</span></small>
            </span>
            <span className="alert-time">{timeAgo(f.firedAt)}</span>
          </div>
        ))}
      </div>
      <div className="alert-panel-footer">
        <span className="alert-count-badge">활성 규칙 {MOCK_FIRINGS.length}개</span>
        <button className="panel-more-link" type="button" onClick={() => navigate('/alerts/new')}>
          + 규칙 추가
        </button>
      </div>
    </div>
  )
}
