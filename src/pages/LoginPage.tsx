import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuthStore } from '../shared/store/authStore'

const schema = z.object({
  email: z.string().min(1, '이메일을 입력하세요').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(4, '비밀번호는 4자 이상'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'demo@coindata.io', password: 'demo1234' },
  })

  async function onSubmit(data: FormValues) {
    setLoginError('')
    setLoading(true)
    try {
      const ok = await login(data.email, data.password)
      if (ok) {
        navigate('/')
      } else {
        setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">₿</span>
          <h1>CoinData</h1>
          <p>프리미엄·캔들·경제지표 통합 대시보드</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2>로그인</h2>

          {loginError && (
            <div className="auth-error" role="alert">{loginError}</div>
          )}

          <div className="form-field">
            <label htmlFor="email">이메일</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="password">비밀번호</label>
            <input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <p className="auth-switch">
            계정이 없으신가요?{' '}
            <button type="button" className="link-button" onClick={() => navigate('/signup')}>회원가입</button>
          </p>
          <p className="auth-demo-hint">데모 계정: demo@coindata.io / demo1234</p>
        </form>
      </div>
    </div>
  )
}
