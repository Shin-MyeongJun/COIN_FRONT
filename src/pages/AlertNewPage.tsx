import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const ASSETS = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA', 'AVAX']
const CHANNELS = ['SSE', 'EMAIL', 'DISCORD'] as const
const TARGET_TYPES = ['PREMIUM', 'TICK', 'INDICATOR'] as const
const OPERATORS = ['>', '>=', '<', '<=', '=='] as const

const schema = z.object({
  label: z.string().min(1, '라벨을 입력하세요').max(50, '최대 50자'),
  targetType: z.enum(TARGET_TYPES),
  asset: z.string().min(1, '자산을 선택하세요'),
  operator: z.enum(OPERATORS),
  threshold: z
    .string()
    .min(1, '임계값을 입력하세요')
    .refine((v) => !isNaN(parseFloat(v)), '숫자를 입력하세요'),
  cooldownSec: z.number().min(10, '최소 10초'),
  channels: z.array(z.enum(CHANNELS)).min(1, '채널을 최소 1개 선택하세요'),
})

type FormValues = z.infer<typeof schema>

export function AlertNewPage() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    console.log('New rule:', data)
    setSaved(true)
    setTimeout(() => navigate('/alerts'), 1200)
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
        <button type="button" className="back-button" onClick={() => navigate('/alerts')}>← 뒤로</button>
      </div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1>알람 규칙 생성</h1>
        </div>
      </div>

      <form className="workspace-panel alert-rule-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-section">
          <h2>기본 정보</h2>

          <div className="form-field">
            <label htmlFor="label">규칙 이름 <span className="required">*</span></label>
            <input id="label" type="text" placeholder="예: BTC 김프 폭발" {...register('label')} />
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
              <label htmlFor="threshold">임계값 (%) <span className="required">*</span></label>
              <input id="threshold" type="text" inputMode="decimal" placeholder="5.0" {...register('threshold')} />
              {errors.threshold && <span className="field-error">{errors.threshold.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="cooldownSec">쿨다운 (초) <span className="required">*</span></label>
              <input id="cooldownSec" type="number" min={10} {...register('cooldownSec', { valueAsNumber: true })} />
              {errors.cooldownSec && <span className="field-error">{errors.cooldownSec.message}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>알림 채널 <span className="required">*</span></h2>
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
          <button type="submit" className="btn-primary">규칙 저장</button>
        </div>
      </form>
    </main>
  )
}
