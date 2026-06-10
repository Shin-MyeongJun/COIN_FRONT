import { useState } from 'react'
import {
  useApiKeysQuery,
  useIssueApiKeyMutation,
  useRevokeApiKeyMutation,
} from '../features/apikey/api/useApiKeyQueries'
import type {
  ApiKeySummaryDto,
  IssueApiKeyResponse,
} from '../features/apikey/api/apikeyTypes'
import { API_KEY_SCOPES, type ApiKeyScope } from '../shared/lib/apiKeyScopes'
import { ProblemDetailAlert } from '../shared/ui/ProblemDetailAlert'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return `${Math.floor(diff / 86_400_000)}일 전`
}

type CreateStep = 1 | 2 | 3

const MAX_KEYS = 10
const DEFAULT_SCOPES: ApiKeyScope[] = ['READ_MARKET']

export function ApiKeysPage() {
  const keysQuery = useApiKeysQuery()
  const issueMutation = useIssueApiKeyMutation()
  const revokeMutation = useRevokeApiKeyMutation()

  const keys = keysQuery.data ?? []
  const activeCount = keys.filter((k) => k.active).length

  const [showCreate, setShowCreate] = useState(false)
  const [step, setStep] = useState<CreateStep>(1)
  const [newLabel, setNewLabel] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<ApiKeyScope[]>(DEFAULT_SCOPES)
  const [issued, setIssued] = useState<IssueApiKeyResponse | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [confirmCopied, setConfirmCopied] = useState(false)
  const [newlyAddedId, setNewlyAddedId] = useState<number | null>(null)

  function openCreate() {
    setNewLabel('')
    setSelectedScopes(DEFAULT_SCOPES)
    setStep(1)
    setCopiedKey(false)
    setCopiedSecret(false)
    setConfirmCopied(false)
    setIssued(null)
    issueMutation.reset()
    setShowCreate(true)
  }

  function goStep2() {
    if (!newLabel.trim() || selectedScopes.length === 0) return
    setStep(2)
  }

  async function goStep3() {
    const res = await issueMutation.mutateAsync({
      label: newLabel.trim(),
      scopes: selectedScopes,
    })
    setIssued(res)
    setNewlyAddedId(res.summary.id)
    window.setTimeout(() => setNewlyAddedId(null), 3000)
    setStep(3)
  }

  function closeDialog() {
    setShowCreate(false)
    // Clear the secret out of memory the moment the dialog closes — the user
    // explicitly confirmed they've saved it (Step 3 gate).
    setIssued(null)
    issueMutation.reset()
  }

  function copyText(text: string, setter: (v: boolean) => void) {
    void navigator.clipboard.writeText(text).then(() => {
      setter(true)
      window.setTimeout(() => setter(false), 2000)
    })
  }

  function deleteKey(id: number) {
    if (!window.confirm('이 API 키를 폐기하시겠습니까?')) return
    revokeMutation.mutate({ id })
  }

  return (
    <main className="page-content api-keys-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">API Keys</p>
          <h1>API 키 관리</h1>
          <p className="page-desc">
            {keysQuery.isPending
              ? '불러오는 중…'
              : `활성 키 ${activeCount}개 / 최대 ${MAX_KEYS}개`}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={openCreate}
          disabled={keysQuery.isPending || keys.length >= MAX_KEYS}
        >
          + 키 생성
        </button>
      </div>

      <ProblemDetailAlert error={keysQuery.error} />
      <ProblemDetailAlert
        error={revokeMutation.error}
        onDismiss={() => revokeMutation.reset()}
      />

      <div className="api-keys-list">
        {keysQuery.isPending && (
          <p className="muted-center" style={{ padding: '24px 0' }}>불러오는 중…</p>
        )}
        {!keysQuery.isPending && keys.length === 0 && (
          <div className="empty-state-card">
            <p>API 키가 없습니다. 첫 키를 생성하세요.</p>
            <button type="button" className="btn-primary" onClick={openCreate}>
              키 생성
            </button>
          </div>
        )}
        {keys.map((key) => (
          <ApiKeyCard
            key={key.id}
            apiKey={key}
            highlight={newlyAddedId === key.id}
            onDelete={() => deleteKey(key.id)}
            deleting={revokeMutation.isPending}
          />
        ))}
      </div>

      {showCreate && (
        <CreateKeyDialog
          step={step}
          newLabel={newLabel}
          selectedScopes={selectedScopes}
          issued={issued}
          copiedKey={copiedKey}
          copiedSecret={copiedSecret}
          confirmCopied={confirmCopied}
          submitting={issueMutation.isPending}
          submitError={issueMutation.error}
          onLabelChange={setNewLabel}
          onScopeToggle={(scope, checked) =>
            setSelectedScopes((prev) =>
              checked ? [...prev, scope] : prev.filter((s) => s !== scope),
            )
          }
          onBackToStep1={() => setStep(1)}
          onStep2={goStep2}
          onStep3={goStep3}
          onCopyKey={(t) => copyText(t, setCopiedKey)}
          onCopySecret={(t) => copyText(t, setCopiedSecret)}
          onConfirmCopiedChange={setConfirmCopied}
          onClose={closeDialog}
        />
      )}
    </main>
  )
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function ApiKeyCard({
  apiKey,
  highlight,
  onDelete,
  deleting,
}: {
  apiKey: ApiKeySummaryDto
  highlight: boolean
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <div
      className={`api-key-card workspace-panel ${apiKey.active ? '' : 'inactive'} ${
        highlight ? 'highlight' : ''
      }`}
    >
      <div className="key-card-header">
        <div className="key-title-row">
          <span className={`rule-status-dot ${apiKey.active ? 'active' : ''}`} />
          <strong>{apiKey.label}</strong>
          <span className="key-prefix-chip">{apiKey.prefix}…</span>
          {apiKey.active ? (
            <span className="status-badge active">활성</span>
          ) : (
            <span className="status-badge">비활성</span>
          )}
        </div>
        <div className="rule-actions">
          <button
            type="button"
            className="btn-sm btn-danger"
            onClick={onDelete}
            disabled={deleting}
          >
            삭제
          </button>
        </div>
      </div>

      <div className="key-card-meta">
        <span>생성: {timeAgo(apiKey.createdAt)}</span>
        <span>
          최근 사용: {apiKey.lastUsedAt !== null ? timeAgo(apiKey.lastUsedAt) : '없음'}
        </span>
        {apiKey.ipRestriction !== null && (
          <span>
            IP 제한: <code>{apiKey.ipRestriction}</code>
          </span>
        )}
      </div>

      <div className="key-scopes">
        {apiKey.scopes.map((s) => (
          <span key={s} className="scope-chip">
            {s}
          </span>
        ))}
      </div>

      {apiKey.active && apiKey.dailyLimit > 0 && (
        <div className="key-usage-bar">
          <div className="usage-labels">
            <span>일일 요청</span>
            <span>
              {apiKey.dailyRequests.toLocaleString()} /{' '}
              {apiKey.dailyLimit.toLocaleString()}
            </span>
          </div>
          <div className="usage-track">
            <div
              className="usage-fill"
              style={{
                width: `${Math.min(100, (apiKey.dailyRequests / apiKey.dailyLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CreateKeyDialog({
  step,
  newLabel,
  selectedScopes,
  issued,
  copiedKey,
  copiedSecret,
  confirmCopied,
  submitting,
  submitError,
  onLabelChange,
  onScopeToggle,
  onBackToStep1,
  onStep2,
  onStep3,
  onCopyKey,
  onCopySecret,
  onConfirmCopiedChange,
  onClose,
}: {
  step: CreateStep
  newLabel: string
  selectedScopes: ApiKeyScope[]
  issued: IssueApiKeyResponse | null
  copiedKey: boolean
  copiedSecret: boolean
  confirmCopied: boolean
  submitting: boolean
  submitError: unknown
  onLabelChange: (v: string) => void
  onScopeToggle: (scope: ApiKeyScope, checked: boolean) => void
  onBackToStep1: () => void
  onStep2: () => void
  onStep3: () => Promise<void>
  onCopyKey: (text: string) => void
  onCopySecret: (text: string) => void
  onConfirmCopiedChange: (v: boolean) => void
  onClose: () => void
}) {
  return (
    <div
      className="dialog-backdrop"
      onClick={step === 3 ? undefined : onClose}
    >
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <>
            <div className="dialog-header">
              <h2>API 키 생성 (1/3)</h2>
              <button
                type="button"
                className="dialog-close"
                onClick={onClose}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="dialog-body">
              <div className="form-field">
                <label htmlFor="new-label">
                  키 라벨 <span className="required">*</span>
                </label>
                <input
                  id="new-label"
                  type="text"
                  placeholder="예: trading-bot-prod"
                  value={newLabel}
                  onChange={(e) => onLabelChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onStep2()
                  }}
                />
              </div>
              <ScopePicker
                selected={selectedScopes}
                onToggle={onScopeToggle}
              />
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                취소
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={onStep2}
                disabled={!newLabel.trim() || selectedScopes.length === 0}
              >
                다음 →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="dialog-header">
              <h2>API 키 생성 (2/3)</h2>
            </div>
            <div className="dialog-body">
              <div className="verify-box">
                <p>아래 내용으로 키를 발급합니다.</p>
                <p>
                  라벨: <strong>{newLabel}</strong>
                </p>
                <p>스코프: {selectedScopes.join(', ')}</p>
              </div>
              <ProblemDetailAlert error={submitError} />
            </div>
            <div className="dialog-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onBackToStep1}
                disabled={submitting}
              >
                ← 이전
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  void onStep3()
                }}
                disabled={submitting}
              >
                {submitting ? '발급 중…' : '키 생성 확인'}
              </button>
            </div>
          </>
        )}

        {step === 3 && issued !== null && (
          <>
            <div className="dialog-header">
              <h2>API 키 생성 완료 (3/3)</h2>
            </div>
            <div className="dialog-body">
              <div className="secret-warning" role="alert">
                🚨{' '}
                <strong>
                  Secret Key는 이 화면을 닫으면 다시 볼 수 없습니다.
                </strong>{' '}
                반드시 복사하세요.
              </div>

              <div className="key-reveal-field">
                <label>API Key</label>
                <div className="key-reveal-row">
                  <code className="key-value">{issued.apiKey}</code>
                  <button
                    type="button"
                    className={`btn-sm ${copiedKey ? 'btn-ok' : ''}`}
                    onClick={() => onCopyKey(issued.apiKey)}
                  >
                    {copiedKey ? '복사됨 ✓' : '복사'}
                  </button>
                </div>
              </div>

              <div className="key-reveal-field">
                <label>Secret Key</label>
                <div className="key-reveal-row">
                  <code className="key-value secret">{issued.secret}</code>
                  <button
                    type="button"
                    className={`btn-sm ${copiedSecret ? 'btn-ok' : ''}`}
                    onClick={() => onCopySecret(issued.secret)}
                  >
                    {copiedSecret ? '복사됨 ✓' : '복사'}
                  </button>
                </div>
              </div>

              <label className="confirm-check-row">
                <input
                  type="checkbox"
                  checked={confirmCopied}
                  onChange={(e) => onConfirmCopiedChange(e.target.checked)}
                />
                <span>Secret Key를 안전한 곳에 복사했습니다.</span>
              </label>
            </div>
            <div className="dialog-footer">
              <button
                type="button"
                className="btn-primary"
                disabled={!confirmCopied}
                onClick={onClose}
              >
                {confirmCopied ? '닫기' : '복사 완료 후 닫기 가능'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ScopePicker({
  selected,
  onToggle,
}: {
  selected: ApiKeyScope[]
  onToggle: (scope: ApiKeyScope, checked: boolean) => void
}) {
  return (
    <div className="form-section" style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 14, marginBottom: 10 }}>권한 스코프 선택</h3>
      {API_KEY_SCOPES.map((s) => (
        <label key={s.id} className="scope-row">
          <input
            type="checkbox"
            checked={selected.includes(s.id)}
            onChange={(e) => onToggle(s.id, e.target.checked)}
          />
          <span className="scope-chip">{s.label}</span>
          <small className="scope-desc">{s.description}</small>
        </label>
      ))}
    </div>
  )
}
