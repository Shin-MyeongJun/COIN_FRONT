import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AlertRule = {
  id: number
  label: string
  targetType: 'PREMIUM' | 'TICK' | 'INDICATOR'
  asset: string
  condition: string
  threshold: string
  cooldownSec: number
  channels: string[]
  active: boolean
  createdAt: number
}

type AlertFiring = {
  id: number
  ruleId: number
  ruleName: string
  condition: string
  observedValue: string
  firedAt: number
}

const MOCK_RULES: AlertRule[] = [
  { id: 1, label: 'BTC 김프 폭발', targetType: 'PREMIUM', asset: 'BTC', condition: '>', threshold: '5', cooldownSec: 60, channels: ['SSE', 'EMAIL'], active: true, createdAt: Date.now() - 7 * 86400_000 },
  { id: 2, label: 'ETH 매도 프리미엄', targetType: 'PREMIUM', asset: 'ETH', condition: '>', threshold: '4.5', cooldownSec: 120, channels: ['SSE'], active: true, createdAt: Date.now() - 3 * 86400_000 },
  { id: 3, label: 'SOL 김프 급등', targetType: 'PREMIUM', asset: 'SOL', condition: '>', threshold: '4', cooldownSec: 300, channels: ['SSE', 'DISCORD'], active: true, createdAt: Date.now() - 86400_000 },
  { id: 4, label: 'XRP 프리미엄 하락', targetType: 'PREMIUM', asset: 'XRP', condition: '<', threshold: '2', cooldownSec: 60, channels: ['SSE'], active: false, createdAt: Date.now() - 14 * 86400_000 },
  { id: 5, label: 'DOGE 급등 감지', targetType: 'TICK', asset: 'DOGE', condition: '>', threshold: '3.5', cooldownSec: 180, channels: ['EMAIL'], active: false, createdAt: Date.now() - 2 * 86400_000 },
]

const MOCK_FIRINGS: AlertFiring[] = [
  { id: 1, ruleId: 1, ruleName: 'BTC 김프 폭발', condition: '> 5%', observedValue: '5.21%', firedAt: Date.now() - 180_000 },
  { id: 2, ruleId: 2, ruleName: 'ETH 매도 프리미엄', condition: '> 4.5%', observedValue: '4.71%', firedAt: Date.now() - 600_000 },
  { id: 3, ruleId: 3, ruleName: 'SOL 김프 급등', condition: '> 4%', observedValue: '4.03%', firedAt: Date.now() - 1_800_000 },
  { id: 4, ruleId: 4, ruleName: 'XRP 프리미엄 하락', condition: '< 2%', observedValue: '1.88%', firedAt: Date.now() - 3_600_000 },
  { id: 5, ruleId: 5, ruleName: 'DOGE 급등 감지', condition: '> 3.5%', observedValue: '3.62%', firedAt: Date.now() - 7_200_000 },
]

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return `${Math.floor(diff / 86_400_000)}일 전`
}

export function AlertsPage() {
  const navigate = useNavigate()
  const [rules, setRules] = useState(MOCK_RULES)
  const [firings, setFirings] = useState(MOCK_FIRINGS)
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules')

  // Mock SSE: simulate random firing every 8 seconds
  useEffect(() => {
    let nextId = MOCK_FIRINGS.length + 1
    const id = setInterval(() => {
      const activeRules = rules.filter((r) => r.active)
      if (!activeRules.length) return
      const rule = activeRules[Math.floor(Math.random() * activeRules.length)]
      const observed = `${(parseFloat(rule.threshold) + (Math.random() * 0.5)).toFixed(2)}%`
      setFirings((prev) => [
        {
          id: nextId++,
          ruleId: rule.id,
          ruleName: rule.label,
          condition: `${rule.condition} ${rule.threshold}%`,
          observedValue: observed,
          firedAt: Date.now(),
        },
        ...prev.slice(0, 19),
      ])
    }, 8000)
    return () => clearInterval(id)
  }, [rules])

  function toggleRule(id: number) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  function deleteRule(id: number) {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const activeCount = rules.filter((r) => r.active).length

  return (
    <main className="alerts-page page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1>알람 관리</h1>
          <p className="page-desc">활성 규칙 <strong>{activeCount}</strong>개 / 전체 {rules.length}개</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/alerts/new')}>
          + 규칙 추가
        </button>
      </div>

      <div className="tab-bar">
        <button type="button" className={activeTab === 'rules' ? 'tab active' : 'tab'} onClick={() => setActiveTab('rules')}>
          규칙 목록
        </button>
        <button type="button" className={activeTab === 'history' ? 'tab active' : 'tab'} onClick={() => setActiveTab('history')}>
          발화 이력 <span className="badge">{firings.length}</span>
        </button>
      </div>

      {activeTab === 'rules' && (
        <div className="alert-rules-list">
          {rules.length === 0 && (
            <div className="empty-state-card">
              <p>등록된 알람 규칙이 없습니다.</p>
              <button type="button" className="btn-primary" onClick={() => navigate('/alerts/new')}>첫 규칙 만들기</button>
            </div>
          )}
          {rules.map((rule) => (
            <div key={rule.id} className={`alert-rule-card workspace-panel ${rule.active ? '' : 'inactive'}`}>
              <div className="rule-card-header">
                <div className="rule-title-row">
                  <span className={`rule-status-dot ${rule.active ? 'active' : ''}`} aria-hidden="true" />
                  <strong>{rule.label}</strong>
                  <span className="rule-asset-chip">{rule.asset}</span>
                  <span className="rule-type-chip">{rule.targetType}</span>
                </div>
                <div className="rule-actions">
                  <button type="button" className="btn-sm" onClick={() => navigate(`/alerts/${rule.id}`)}>편집</button>
                  <button
                    type="button"
                    className={`btn-sm ${rule.active ? 'btn-warn' : 'btn-ok'}`}
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.active ? '비활성화' : '활성화'}
                  </button>
                  <button type="button" className="btn-sm btn-danger" onClick={() => deleteRule(rule.id)}>삭제</button>
                </div>
              </div>
              <div className="rule-card-body">
                <span>조건: <code>{rule.asset} 프리미엄 {rule.condition} {rule.threshold}%</code></span>
                <span>쿨다운: {rule.cooldownSec}초</span>
                <span>채널: {rule.channels.join(', ')}</span>
                <span className="rule-created">생성: {timeAgo(rule.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="alert-history-list">
          {firings.map((f) => (
            <div key={f.id} className="alert-firing-row workspace-panel">
              <span className="alert-dot" aria-hidden="true" />
              <div className="firing-info">
                <strong>{f.ruleName}</strong>
                <small>{f.condition} → 관측값 <span className="text-positive">{f.observedValue}</span></small>
              </div>
              <span className="alert-time">{timeAgo(f.firedAt)}</span>
            </div>
          ))}
          {firings.length === 0 && <p className="muted-center">발화 이력이 없습니다.</p>}
        </div>
      )}
    </main>
  )
}
