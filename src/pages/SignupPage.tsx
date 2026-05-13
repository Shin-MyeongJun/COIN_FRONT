import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, '이름은 2자 이상').max(20, '이름은 20자 이하'),
  email: z.string().min(1, '이메일을 입력하세요').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상'),
  confirm: z.string().min(1, '비밀번호를 확인해주세요'),
}).refine((d) => d.password === d.confirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirm'],
})

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(_data: FormValues) {
    setDone(true)
    setTimeout(() => navigate('/login'), 1500)
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="save-success-card">
            <span className="save-check">✓</span>
            <h2>가입이 완료되었습니다</h2>
            <p>로그인 페이지로 이동 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">₿</span>
          <h1>CoinData</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2>회원가입</h2>

          <div className="form-field">
            <label htmlFor="name">이름</label>
            <input id="name" type="text" autoComplete="name" {...register('name')} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="email">이메일</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="password">비밀번호 (8자 이상)</label>
            <input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="confirm">비밀번호 확인</label>
            <input id="confirm" type="password" autoComplete="new-password" {...register('confirm')} />
            {errors.confirm && <span className="field-error">{errors.confirm.message}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit">가입하기</button>

          <p className="auth-switch">
            이미 계정이 있으신가요?{' '}
            <button type="button" className="link-button" onClick={() => navigate('/login')}>로그인</button>
          </p>
        </form>
      </div>
    </div>
  )
}
