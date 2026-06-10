import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAlertFiringsQuery,
  useAlertRulesQuery,
  useDeleteAlertRuleMutation,
  useToggleAlertRuleMutation,
} from '../features/alert/api/useAlertQueries'
import { ProblemDetailAlert } from '../shared/ui/ProblemDetailAlert'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return `${Math.floor(diff / 86_400_000)}일 전`
}

export function AlertsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules')

  const rulesQuery = useAlertRulesQuery()
  const firingsQuery = useAlertFiringsQuery()
  const toggleMutation = useToggleAlertRuleMutation()
  const deleteMutation = useDeleteAlertRuleMutation()

  const rules = rulesQuery.data?.items ?? []
  const firings = firingsQuery.data?.items ?? []
  const activeCount = rules.filter((r) => r.active).length
  const totalCount = rulesQuery.data?.total ?? rules.length

  function handleToggle(id: number, nextActive: boolean) {
    toggleMutation.mutate({ id, nextActive })
  }

  function handleDelete(id: number) {
    if (!window.confirm('이 규칙을 삭제하시겠습니까?')) return
    deleteMutation.mutate({ id })
  }

  return (
    <main className="alerts-page page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1>알람 관리</h1>
          <p className="page-desc">
            {rulesQuery.isPending
              ? '불러오는 중…'
              : <>활성 규칙 <strong>{activeCount}</strong>개 / 전체 {totalCount}개</>}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/alerts/new')}>
          + 규칙 추가
        </button>
      </div>

      <ProblemDetailAlert error={rulesQuery.error} />
      <ProblemDetailAlert error={firingsQuery.error} />
      <ProblemDetailAlert
        error={toggleMutation.error}
        onDismiss={() => toggleMutation.reset()}
      />
      <ProblemDetailAlert
        error={deleteMutation.error}
        onDismiss={() => deleteMutation.reset()}
      />

      <div className="tab-bar">
        <button
          type="button"
          className={activeTab === 'rules' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('rules')}
        >
          규칙 목록
        </button>
        <button
          type="button"
          className={activeTab === 'history' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('history')}
        >
          발화 이력 <span className="badge">{firings.length}</span>
        </button>
      </div>

      {activeTab === 'rules' && (
        <div className="alert-rules-list">
          {rulesQuery.isPending && (
            <p className="muted-center" style={{ padding: '24px 0' }}>불러오는 중…</p>
          )}
          {!rulesQuery.isPending && rules.length === 0 && (
            <div className="empty-state-card">
              <p>등록된 알람 규칙이 없습니다.</p>
              <button type="button" className="btn-primary" onClick={() => navigate('/alerts/new')}>
                첫 규칙 만들기
              </button>
            </div>
          )}
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`alert-rule-card workspace-panel ${rule.active ? '' : 'inactive'}`}
            >
              <div className="rule-card-header">
                <div className="rule-title-row">
                  <span
                    className={`rule-status-dot ${rule.active ? 'active' : ''}`}
                    aria-hidden="true"
                  />
                  <strong>{rule.label}</strong>
                  <span className="rule-asset-chip">{rule.targetIdentifiers.join(', ')}</span>
                  <span className="rule-type-chip">{rule.targetType}</span>
                </div>
                <div className="rule-actions">
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => navigate(`/alerts/${rule.id}`)}
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    className={`btn-sm ${rule.active ? 'btn-warn' : 'btn-ok'}`}
                    onClick={() => handleToggle(rule.id, !rule.active)}
                    disabled={toggleMutation.isPending}
                  >
                    {rule.active ? '비활성화' : '활성화'}
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-danger"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deleteMutation.isPending}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className="rule-card-body">
                <span>
                  조건:{' '}
                  <code>
                    {rule.targetIdentifiers.join(',')} {rule.metric} {rule.operator} {rule.threshold}
                  </code>
                </span>
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
          {firingsQuery.isPending && (
            <p className="muted-center" style={{ padding: '24px 0' }}>불러오는 중…</p>
          )}
          {firings.map((f) => (
            <div key={f.id} className="alert-firing-row workspace-panel">
              <span className="alert-dot" aria-hidden="true" />
              <div className="firing-info">
                <strong>{f.ruleLabel}</strong>
                <small>
                  {f.metric} {f.threshold} → 관측값{' '}
                  <span className="text-positive">{f.observedValue}</span>
                </small>
              </div>
              <span className="alert-time">{timeAgo(f.firedAt)}</span>
            </div>
          ))}
          {!firingsQuery.isPending && firings.length === 0 && (
            <p className="muted-center">발화 이력이 없습니다.</p>
          )}
        </div>
      )}
    </main>
  )
}
