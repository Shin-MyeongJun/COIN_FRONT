import { useState } from 'react'

const SCOPES = [
  { id: 'market:read', label: 'market:read', desc: '마켓/틱/김프/FX 조회' },
  { id: 'analytics:read', label: 'analytics:read', desc: '캔들/지표 조회' },
  { id: 'economic:read', label: 'economic:read', desc: '경제지표 조회' },
  { id: 'stream:subscribe', label: 'stream:subscribe', desc: 'SSE 구독' },
  { id: 'watchlist:write', label: 'watchlist:write', desc: '워치리스트 변경' },
  { id: 'alert:write', label: 'alert:write', desc: '알람 규칙 변경' },
]

type ApiKey = {
  id: number
  label: string
  prefix: string
  scopes: string[]
  ipRestriction: string | null
  active: boolean
  createdAt: number
  lastUsedAt: number | null
  dailyRequests: number
  dailyLimit: number
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: 1,
    label: 'trading-bot-prod',
    prefix: 'cd_live_xk7m...',
    scopes: ['market:read', 'stream:subscribe', 'analytics:read'],
    ipRestriction: '203.0.113.42',
    active: true,
    createdAt: Date.now() - 60 * 86400_000,
    lastUsedAt: Date.now() - 5 * 60_000,
    dailyRequests: 12403,
    dailyLimit: 50000,
  },
  {
    id: 2,
    label: 'personal-dashboard',
    prefix: 'cd_live_p9nq...',
    scopes: ['market:read', 'analytics:read', 'economic:read'],
    ipRestriction: null,
    active: false,
    createdAt: Date.now() - 10 * 86400_000,
    lastUsedAt: null,
    dailyRequests: 0,
    dailyLimit: 50000,
  },
]

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return `${Math.floor(diff / 86_400_000)}일 전`
}

function randomHex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

type CreateStep = 1 | 2 | 3

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS)
  const [showCreate, setShowCreate] = useState(false)
  const [step, setStep] = useState<CreateStep>(1)
  const [newLabel, setNewLabel] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['market:read'])
  const [generatedKey, setGeneratedKey] = useState({ apiKey: '', secret: '' })
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [confirmCopied, setConfirmCopied] = useState(false)
  const [newlyAddedId, setNewlyAddedId] = useState<number | null>(null)

  const activeCount = keys.filter((k) => k.active).length

  function openCreate() {
    setNewLabel('')
    setSelectedScopes(['market:read'])
    setStep(1)
    setCopiedKey(false)
    setCopiedSecret(false)
    setConfirmCopied(false)
    setShowCreate(true)
  }

  function goStep2() {
    if (!newLabel.trim()) return
    setStep(2)
  }

  function goStep3() {
    const apiKey = `cd_live_${randomHex(16)}`
    const secret = `cd_secret_${randomHex(40)}`
    setGeneratedKey({ apiKey, secret })
    const newId = keys.length > 0 ? Math.max(...keys.map((k) => k.id)) + 1 : 1
    const created: ApiKey = {
      id: newId,
      label: newLabel.trim(),
      prefix: `${apiKey.slice(0, 14)}...`,
      scopes: selectedScopes,
      ipRestriction: null,
      active: true,
      createdAt: Date.now(),
      lastUsedAt: null,
      dailyRequests: 0,
      dailyLimit: 50000,
    }
    setKeys((prev) => [created, ...prev])
    setNewlyAddedId(newId)
    setTimeout(() => setNewlyAddedId(null), 3000)
    setStep(3)
  }

  function closeDialog() {
    setShowCreate(false)
  }

  function copyText(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2000)
    })
  }

  function toggleKeyActive(id: number) {
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, active: !k.active } : k))
  }

  function deleteKey(id: number) {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <main className="page-content api-keys-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">API Keys</p>
          <h1>API 키 관리</h1>
          <p className="page-desc">활성 키 {activeCount}개 / 최대 10개</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate} disabled={keys.length >= 10}>
          + 키 생성
        </button>
      </div>

      <div className="api-keys-list">
        {keys.length === 0 && (
          <div className="empty-state-card">
            <p>API 키가 없습니다. 첫 키를 생성하세요.</p>
            <button type="button" className="btn-primary" onClick={openCreate}>키 생성</button>
          </div>
        )}
        {keys.map((key) => (
          <div
            key={key.id}
            className={`api-key-card workspace-panel ${key.active ? '' : 'inactive'} ${newlyAddedId === key.id ? 'highlight' : ''}`}
          >
            <div className="key-card-header">
              <div className="key-title-row">
                <span className={`rule-status-dot ${key.active ? 'active' : ''}`} />
                <strong>{key.label}</strong>
                <span className="key-prefix-chip">{key.prefix}</span>
                {key.active ? <span className="status-badge active">활성</span> : <span className="status-badge">비활성</span>}
              </div>
              <div className="rule-actions">
                <button type="button" className={`btn-sm ${key.active ? 'btn-warn' : 'btn-ok'}`} onClick={() => toggleKeyActive(key.id)}>
                  {key.active ? '비활성화' : '활성화'}
                </button>
                <button type="button" className="btn-sm btn-danger" onClick={() => deleteKey(key.id)}>삭제</button>
              </div>
            </div>

            <div className="key-card-meta">
              <span>생성: {timeAgo(key.createdAt)}</span>
              <span>최근 사용: {key.lastUsedAt ? timeAgo(key.lastUsedAt) : '없음'}</span>
              {key.ipRestriction && <span>IP 제한: <code>{key.ipRestriction}</code></span>}
            </div>

            <div className="key-scopes">
              {key.scopes.map((s) => <span key={s} className="scope-chip">{s}</span>)}
            </div>

            {key.active && (
              <div className="key-usage-bar">
                <div className="usage-labels">
                  <span>일일 요청</span>
                  <span>{key.dailyRequests.toLocaleString()} / {key.dailyLimit.toLocaleString()}</span>
                </div>
                <div className="usage-track">
                  <div className="usage-fill" style={{ width: `${(key.dailyRequests / key.dailyLimit) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Key Dialog */}
      {showCreate && (
        <div className="dialog-backdrop" onClick={step === 3 ? undefined : closeDialog}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            {step === 1 && (
              <>
                <div className="dialog-header">
                  <h2>API 키 생성 (1/3)</h2>
                  <button type="button" className="dialog-close" onClick={closeDialog} aria-label="닫기">✕</button>
                </div>
                <div className="dialog-body">
                  <div className="form-field">
                    <label htmlFor="new-label">키 라벨 <span className="required">*</span></label>
                    <input
                      id="new-label"
                      type="text"
                      placeholder="예: trading-bot-prod"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && goStep2()}
                    />
                  </div>
                  <div className="form-section" style={{ marginTop: 16 }}>
                    <h3 style={{ fontSize: 14, marginBottom: 10 }}>권한 스코프 선택</h3>
                    {SCOPES.map((s) => (
                      <label key={s.id} className="scope-row">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedScopes((p) => [...p, s.id])
                            else setSelectedScopes((p) => p.filter((x) => x !== s.id))
                          }}
                        />
                        <span className="scope-chip">{s.label}</span>
                        <small className="scope-desc">{s.desc}</small>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="dialog-footer">
                  <button type="button" className="btn-secondary" onClick={closeDialog}>취소</button>
                  <button type="button" className="btn-primary" onClick={goStep2} disabled={!newLabel.trim() || selectedScopes.length === 0}>다음 →</button>
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
                    <p>⚠️ mock 단계입니다. 실제 서비스에서는 2FA 인증이 필요합니다.</p>
                    <p>라벨: <strong>{newLabel}</strong></p>
                    <p>스코프: {selectedScopes.join(', ')}</p>
                  </div>
                </div>
                <div className="dialog-footer">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← 이전</button>
                  <button type="button" className="btn-primary" onClick={goStep3}>키 생성 확인</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="dialog-header">
                  <h2>API 키 생성 완료 (3/3)</h2>
                </div>
                <div className="dialog-body">
                  <div className="secret-warning" role="alert">
                    🚨 <strong>Secret Key는 이 화면을 닫으면 다시 볼 수 없습니다.</strong> 반드시 복사하세요.
                  </div>

                  <div className="key-reveal-field">
                    <label>API Key</label>
                    <div className="key-reveal-row">
                      <code className="key-value">{generatedKey.apiKey}</code>
                      <button type="button" className={`btn-sm ${copiedKey ? 'btn-ok' : ''}`} onClick={() => copyText(generatedKey.apiKey, setCopiedKey)}>
                        {copiedKey ? '복사됨 ✓' : '복사'}
                      </button>
                    </div>
                  </div>

                  <div className="key-reveal-field">
                    <label>Secret Key</label>
                    <div className="key-reveal-row">
                      <code className="key-value secret">{generatedKey.secret}</code>
                      <button type="button" className={`btn-sm ${copiedSecret ? 'btn-ok' : ''}`} onClick={() => copyText(generatedKey.secret, setCopiedSecret)}>
                        {copiedSecret ? '복사됨 ✓' : '복사'}
                      </button>
                    </div>
                  </div>

                  <label className="confirm-check-row">
                    <input type="checkbox" checked={confirmCopied} onChange={(e) => setConfirmCopied(e.target.checked)} />
                    <span>Secret Key를 안전한 곳에 복사했습니다.</span>
                  </label>
                </div>
                <div className="dialog-footer">
                  <button type="button" className="btn-primary" disabled={!confirmCopied} onClick={closeDialog}>
                    {confirmCopied ? '닫기' : '복사 완료 후 닫기 가능'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
