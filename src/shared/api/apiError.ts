/**
 * Single error type thrown from the HTTP client.
 *
 * Combines three failure modes into one shape:
 *   - HTTP non-2xx with RFC 7807 ProblemDetail body
 *   - HTTP non-2xx with non-problem body (synthesized ProblemDetail)
 *   - network/fetch failure (status=0, code='NETWORK')
 *
 * Callers should narrow with `isApiError(e)` and branch on `status` / `code`.
 */

import type { ProblemDetail } from './types'

export type ApiErrorInit = {
  status: number
  title: string
  detail?: string
  /**
   * Machine-readable code. For backend ProblemDetail responses this is
   * the `type` URI. For network failures this is the literal `'NETWORK'`.
   */
  code?: string
  /** Original ProblemDetail body when the failure came from the backend. */
  problem?: ProblemDetail
}

export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail?: string
  readonly code?: string
  readonly problem?: ProblemDetail

  constructor(init: ApiErrorInit) {
    const detailSuffix = init.detail !== undefined && init.detail !== '' ? `: ${init.detail}` : ''
    super(`${init.title} (status ${init.status}${detailSuffix})`)
    this.name = 'ApiError'
    this.status = init.status
    this.title = init.title
    this.detail = init.detail
    this.code = init.code
    this.problem = init.problem
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError

/** True when the failure never reached the server (DNS, offline, CORS, abort-as-error). */
export const isNetworkApiError = (e: unknown): e is ApiError =>
  isApiError(e) && e.status === 0 && e.code === 'NETWORK'
