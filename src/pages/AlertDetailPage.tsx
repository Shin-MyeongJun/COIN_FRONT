import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

const ASSETS = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA', 'AVAX']
const CHANNELS = ['SSE', 'EMAIL', 'DISCORD'] as const
const TARGET_TYPES = ['PREMIUM', 'TICK', 'INDICATOR'] as const
const OPERATORS = ['>', '>=', '<', '<=', '=='] as const

const MOCK_RULES: Record<string, {
  label: string; targetType: 'PREMIUM' | 'TICK' | 'INDICATOR'
  asset: string; operator: '>' | '>=' | '<' | '<=' | '=='
  threshold: string; cooldownSec: number; channels: ('SSE' | 'EMAIL' | 'DISCORD')[]
}> = {
  '1': { label: 'BTC 김프 폭발', targetType: 'PREMIUM', asset: 'BTC', operator: '>', threshold: '5', cooldownSec: 60, channels: ['SSE', 'EMAIL'] },
  '2': { label: 'ETH 매도 프리미엄', targetType: 'PREMIUM', asset: 'ETH', operator: '>', threshold: '4.5', cooldownSec: 120, channels: ['SSE'] },
  '3': { label: 'SOL 김프 급등', targetType: 'PREMIUM', asset: 'SOL', operator: '>', threshold: '4', cooldownSec: 300, channels: ['SSE', 'DISCORD'] },
  '4': { label: 'XRP 프리미엄 하락', targetType: 'PREMIUM', asset: 'XRP', operator: '<', threshold: '2', cooldownSec: 60, channels: ['SSE'] },
  '5': { label: 'DOGE 급등 감지', targetType: 'TICK', asset: 'DOGE', operator: '>', threshold: '3.5', cooldownSec: 180, channels: ['EMAIL'] },
}

const schema = z.object({
  label: z.string().min(1, '라벨을 입력하세요').max(50, '최대 50자'),
  targetType: z.enum(TARGET_TYPES),
  asset: z.string().min(1, '자산을 선택하세요'),
  operator: z.enum(OPERATORS),
  threshold: z.string().min(1, '임계값을 입력하세요').refine((v) => !isNaN(parseFloat(v)), '숫자를 입력하세요'),
  cooldownSec: z.number().min(10, '최소 10초'),
  channels: z.array(z.enum(CHANNELS)).min(1, '채널을 최소 1개 선택하세요'),
})

type FormValues = z.infer<typeof schema>

export function AlertDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const rule = id ? MOCK_RULES[id] : null

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: rule ?? {
      label: '',
      targetType: 'PREMIUM',
      asset: 'BTC',
      operator: '>',
      threshold: '5',
      cooldownSec: 60,
      channels: ['SSE'],
    },
  })

  const watchedChannels = watch('channels')

  function toggleChannel(ch: typeof CHANNELS[number]) {
    const cur = watchedChannels ?? []
    const next = cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch]
    setValue('channels', next, { shouldValidate: true })
  }

  function onSubmit(data: FormValues) {
    console.log('Updated rule:', data)
    setSaved(true)
    setTimeout(() => navigate('/alerts'), 1200)
  }

  if (!rule) {
    return (
      <main className="page-content">
        <div className="workspace-panel" style={{ padding: 40, textAlign: 'center' }}>
          <p>규칙 #{id}를 찾을 수 없습니다.</p>
          <button type="button" className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/alerts')}>목록으로</button>
        </div>
      </main>
    )
  }

  if (saved) {
    return (
      <main className="page-content">
        <div className="save-success-card workspace-panel">
          <span className="save-check">✓</span>
          <h2>변경사항이 저장되었습니다</h2>
          <p>목록으로 이동 중...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-content alert-form-page">
      <div style={{ marginBottom: 10 }}>
        <button type="button" className="back-button" onClick={() => navigate('/alerts')}>← 뒤로</button>
      </div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1>알람 규칙 #{id} 편집</h1>
        </div>
      </div>

      <form className="workspace-panel alert-rule-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-section">
          <h2>기본 정보</h2>
          <div className="form-field">
            <label htmlFor="label">규칙 이름 <span className="required">*</span></label>
            <input id="label" type="text" {...register('label')} />
            {errors.label && <span className="field-error">{errors.label.message}</span>}
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="targetType">대상 타입</label>
              <select id="targetType" {...register('targetType')}>
                {TARGET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="asset">자산</label>
              <select id="asset" {...register('asset')}>
                {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>조건 설정</h2>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="operator">연산자</label>
              <select id="operator" {...register('operator')}>
                {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="threshold">임계값 (%)</label>
              <input id="threshold" type="text" inputMode="decimal" {...register('threshold')} />
              {errors.threshold && <span className="field-error">{errors.threshold.message}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="cooldownSec">쿨다운 (초)</label>
              <input id="cooldownSec" type="number" min={10} {...register('cooldownSec', { valueAsNumber: true })} />
              {errors.cooldownSec && <span className="field-error">{errors.cooldownSec.message}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>알림 채널</h2>
          <div className="channel-picker">
            {CHANNELS.map((ch) => (
              <label key={ch} className={`channel-chip ${watchedChannels?.includes(ch) ? 'selected' : ''}`}>
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/alerts')}>취소</button>
          <button type="submit" className="btn-primary">저장</button>
        </div>
      </form>
    </main>
  )
}
