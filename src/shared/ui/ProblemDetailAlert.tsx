/**
 * Surfacing component for ApiError responses (RFC 7807 ProblemDetail).
 *
 * Use anywhere a mutation or query may fail with a backend-typed error and
 * the screen should show a user-readable explanation rather than a generic
 * "something went wrong". Specifically tuned for the private-resource flows
 * (watchlist, alerts) where 401/403 must read clearly.
 *
 * Render nothing when `error` is null/undefined or not an ApiError —
 * non-ApiError throws are unexpected and should be handled by ErrorBoundary.
 */

import type { ReactNode } from 'react'
import { ApiError, isApiError } from '../api/apiError'

type Props = {
  error: unknown
  /** Optional onDismiss to render an X button. */
  onDismiss?: () => void
  /** Render-prop for an extra action (e.g. retry button). */
  action?: ReactNode
}

function statusCopy(err: ApiError): { title: string; detail: string } {
  if (err.code === 'NETWORK') {
    return {
      title: '서버에 연결하지 못했습니다',
      detail: '네트워크 상태를 확인하고 다시 시도해주세요.',
    }
  }
  if (err.status === 401) {
    return {
      title: '인증이 필요합니다',
      detail: '세션이 만료되었거나 로그인이 필요합니다. 다시 로그인해주세요.',
    }
  }
  if (err.status === 403) {
    return {
      title: '권한이 없습니다',
      detail: err.detail ?? '다른 계정의 리소스에는 접근할 수 없습니다.',
    }
  }
  if (err.status === 404) {
    return { title: '찾을 수 없습니다', detail: err.detail ?? '대상이 존재하지 않습니다.' }
  }
  if (err.status === 409) {
    return { title: '중복된 요청', detail: err.detail ?? '이미 등록된 항목입니다.' }
  }
  if (err.status >= 500) {
    return {
      title: '서버 오류',
      detail: err.detail ?? '잠시 후 다시 시도해주세요.',
    }
  }
  return { title: err.title, detail: err.detail ?? '' }
}

export function ProblemDetailAlert({ error, onDismiss, action }: Props) {
  if (error === null || error === undefined) return null
  if (!isApiError(error)) return null

  const { title, detail } = statusCopy(error)

  return (
    <div className="problem-detail-alert" role="alert">
      <div className="problem-detail-body">
        <strong>{title}</strong>
        {detail !== '' && <span>{detail}</span>}
      </div>
      <div className="problem-detail-actions">
        {action}
        {onDismiss !== undefined && (
          <button
            type="button"
            className="btn-sm"
            onClick={onDismiss}
            aria-label="알림 닫기"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
