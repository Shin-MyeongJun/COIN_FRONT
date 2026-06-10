import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateAlertRuleMutation } from '../features/alert/api/useAlertQueries'
import {
  ASSET_CANDIDATES,
  CHANNELS,
  OPERATORS,
  PREMIUM_METRICS,
  TARGET_TYPES,
  alertRuleSchema,
  defaultAlertRuleFormValues,
  formValuesToCreateRequest,
  type AlertRuleFormValues,
} from '../features/alert/model/alertRuleForm'
import { ProblemDetailAlert } from '../shared/ui/ProblemDetailAlert'

export function AlertNewPage() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const createMutation = useCreateAlertRuleMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AlertRuleFormValues>({
    resolver: zodResolver(alertRuleSchema),
    defaultValues: defaultAlertRuleFormValues(),
  })

  const watchedChannels = watch('channels')
  const watchedTargets = watch('targetIdentifiers')
  const watchedTargetType = watch('targetType')

  function toggleChannel(ch: (typeof CHANNELS)[number]) {
    const cur = watchedChannels ?? []
    const next = cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch]
    setValue('channels', next, { shouldValidate: true })
  }

  function toggleTarget(asset: string) {
    const cur = watchedTargets ?? []
    const next = cur.includes(asset) ? cur.filter((a) => a !== asset) : [...cur, asset]
    setValue('targetIdentifiers', next, { shouldValidate: true })
  }

  async function onSubmit(data: AlertRuleFormValues) {
    try {
      await createMutation.mutateAsync(formValuesToCreateRequest(data))
      setSaved(true)
      setTimeout(() => navigate('/alerts'), 1200)
    } catch {
      // ProblemDetailAlert above shows the backend message.
    }
  }

  if (saved) {
    return (
      <main className="page-content">
        <div className="save-success-card workspace-panel">
          <span className="save-check">✓</span>
          <h2>알람 규칙이 저장되었습니다</h2>
          <p>목록으로 이동 중...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-content alert-form-page">
      <div style={{ marginBottom: 10 }}>
        <button type="button" className="back-button" onClick={() => navigate('/alerts')}>
          ← 뒤로
        </button>
      </div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1>알람 규칙 생성</h1>
        </div>
      </div>

      <ProblemDetailAlert
        error={createMutation.error}
        onDismiss={() => createMutation.reset()}
      />

      <form
        className="workspace-panel alert-rule-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="form-section">
          <h2>기본 정보</h2>

          <div className="form-field">
            <label htmlFor="label">
              규칙 이름 <span className="required">*</span>
            </label>
            <input id="label" type="text" placeholder="예: BTC 김프 폭발" {...register('label')} />
            {errors.label && <span className="field-error">{errors.label.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="targetType">대상 타입</label>
              <select id="targetType" {...register('targetType')}>
                {TARGET_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {watchedTargetType === 'PREMIUM' && (
              <div className="form-field">
                <label htmlFor="metric">지표</label>
                <select id="metric" {...register('metric')}>
                  {PREMIUM_METRICS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.metric && <span className="field-error">{errors.metric.message}</span>}
              </div>
            )}

            {watchedTargetType !== 'PREMIUM' && (
              <div className="form-field">
                <label htmlFor="metric">지표 (자유 입력)</label>
                <input id="metric" type="text" placeholder="예: RSI, PRICE" {...register('metric')} />
                {errors.metric && <span className="field-error">{errors.metric.message}</span>}
              </div>
            )}
          </div>

          <div className="form-field">
            <label>
              대상 자산 <span className="required">*</span>
            </label>
            <div className="channel-picker">
              {ASSET_CANDIDATES.map((a) => (
                <label
                  key={a}
                  className={`channel-chip ${watchedTargets?.includes(a) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="visually-hidden"
                    checked={watchedTargets?.includes(a) ?? false}
                    onChange={() => toggleTarget(a)}
                  />
                  {a}
                </label>
              ))}
            </div>
            {errors.targetIdentifiers && (
              <span className="field-error">{errors.targetIdentifiers.message}</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>조건 설정</h2>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="operator">연산자</label>
              <select id="operator" {...register('operator')}>
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="threshold">
                임계값 <span className="required">*</span>
              </label>
              <input
                id="threshold"
                type="text"
                inputMode="decimal"
                placeholder="5.0"
                {...register('threshold')}
              />
              {errors.threshold && (
                <span className="field-error">{errors.threshold.message}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="cooldownSec">
                쿨다운 (초) <span className="required">*</span>
              </label>
              <input
                id="cooldownSec"
                type="number"
                min={10}
                {...register('cooldownSec', { valueAsNumber: true })}
              />
              {errors.cooldownSec && (
                <span className="field-error">{errors.cooldownSec.message}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            알림 채널 <span className="required">*</span>
          </h2>
          <div className="channel-picker">
            {CHANNELS.map((ch) => (
              <label
                key={ch}
                className={`channel-chip ${watchedChannels?.includes(ch) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  className="visually-hidden"
                  checked={watchedChannels?.includes(ch) ?? false}
                  onChange={() => toggleChannel(ch)}
                />
                {ch}
              </label>
            ))}
          </div>
          {errors.channels && <span className="field-error">{errors.channels.message}</span>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/alerts')}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? '저장 중…' : '규칙 저장'}
          </button>
        </div>
      </form>
    </main>
  )
}
