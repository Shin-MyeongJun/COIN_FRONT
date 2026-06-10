/**
 * Backend HTTP client.
 *
 * Responsibilities:
 *   - resolve relative paths against env.apiBaseUrl
 *   - JSON request/response serialization
 *   - always send credentials so the refresh httpOnly cookie travels along
 *   - inject Authorization: Bearer <access> from authToken module (unless auth:false)
 *   - parse RFC 7807 ProblemDetail into ApiError
 *   - normalize fetch failures into ApiError(status:0, code:'NETWORK')
 *
 * Components / pages MUST go through feature `*Api.ts` files — never call
 * this module directly from UI code.
 */

import { env } from '../config/env'
import { ApiError } from './apiError'
import { getAccessToken } from './authToken'
import type { CursorPage, OffsetPage, ProblemDetail } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type QueryValue = string | number | boolean | undefined | null
export type QueryParams = Record<string, QueryValue>

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestOptions = {
  params?: QueryParams
  body?: unknown
  headers?: Record<string, string>
  /** Attach Authorization header when a token is present. Default: true. */
  auth?: boolean
  /** Caller-provided cancel signal. */
  signal?: AbortSignal
}

// ─────────────────────────────────────────────────────────────────────────────
// URL helpers
// ─────────────────────────────────────────────────────────────────────────────

export function buildApiUrl(path: string, params: QueryParams = {}): string {
  const url = new URL(path, env.apiBaseUrl)
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }
  return url.toString()
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: response parsing
// ─────────────────────────────────────────────────────────────────────────────

const PROBLEM_JSON = 'application/problem+json'
const JSON_TYPE = 'application/json'

async function parseProblemDetail(response: Response, url: string): Promise<ProblemDetail> {
  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes(PROBLEM_JSON) || contentType.includes(JSON_TYPE)) {
    try {
      const body = (await response.json()) as Partial<ProblemDetail> & Record<string, unknown>
      return {
        type: typeof body.type === 'string' ? body.type : 'about:blank',
        title:
          typeof body.title === 'string' && body.title.length > 0
            ? body.title
            : response.statusText || 'Request failed',
        status: typeof body.status === 'number' ? body.status : response.status,
        detail: typeof body.detail === 'string' ? body.detail : undefined,
        instance: typeof body.instance === 'string' ? body.instance : url,
      }
    } catch {
      // fall through to text branch
    }
  }
  const text = await response.text().catch(() => '')
  return {
    type: 'about:blank',
    title: response.statusText || 'Request failed',
    status: response.status,
    detail: text !== '' ? text : undefined,
    instance: url,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core request
// ─────────────────────────────────────────────────────────────────────────────

export async function request<T>(
  method: HttpMethod,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { params, body, headers = {}, auth = true, signal } = opts
  const url = buildApiUrl(path, params)

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  }
  if (body !== undefined && finalHeaders['Content-Type'] === undefined) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (auth !== false) {
    const token = getAccessToken()
    if (token !== undefined && finalHeaders['Authorization'] === undefined) {
      finalHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal,
    })
  } catch (err) {
    // Re-throw caller-initiated aborts as-is so React Query / consumers
    // can distinguish cancellation from real network failures.
    if (signal?.aborted === true) {
      throw err
    }
    throw new ApiError({
      status: 0,
      title: 'Network request failed',
      detail: err instanceof Error ? err.message : `Failed to reach ${url}`,
      code: 'NETWORK',
    })
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (!response.ok || contentType.includes(PROBLEM_JSON)) {
    const problem = await parseProblemDetail(response, url)
    throw new ApiError({
      status: problem.status,
      title: problem.title,
      detail: problem.detail,
      code: problem.type,
      problem,
    })
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (text === '') return undefined as T
  return JSON.parse(text) as T
}

// ─────────────────────────────────────────────────────────────────────────────
// Thin per-method wrappers
//
// getJson signature is preserved (path, params?, opts?) so existing callers
// (marketApi, economicApi, …) keep compiling without edits.
// ─────────────────────────────────────────────────────────────────────────────

export function getJson<T>(
  path: string,
  params?: QueryParams,
  opts?: Omit<RequestOptions, 'params' | 'body'>,
): Promise<T> {
  return request<T>('GET', path, { ...opts, params })
}

export function postJson<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  opts?: Omit<RequestOptions, 'body'>,
): Promise<TResponse> {
  return request<TResponse>('POST', path, { ...opts, body })
}

export function putJson<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  opts?: Omit<RequestOptions, 'body'>,
): Promise<TResponse> {
  return request<TResponse>('PUT', path, { ...opts, body })
}

export function del<TResponse>(
  path: string,
  opts?: Omit<RequestOptions, 'body'>,
): Promise<TResponse> {
  return request<TResponse>('DELETE', path, opts)
}

// ─────────────────────────────────────────────────────────────────────────────
// Paging envelope helpers
//
// Backends speak two envelopes:
//   - cursor (time-series):    { items, nextCursor, hasMore }
//   - offset (list endpoints): { items, page, size, total }
//
// `unwrap*` validate the shape and re-emit a typed view so callers can pass
// the raw `unknown` from `request<unknown>` into them safely.
// ─────────────────────────────────────────────────────────────────────────────

export function isCursorPage<T>(v: unknown): v is CursorPage<T> {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return Array.isArray(o.items) && 'nextCursor' in o && typeof o.hasMore === 'boolean'
}

export function isOffsetPage<T>(v: unknown): v is OffsetPage<T> {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    Array.isArray(o.items) &&
    typeof o.page === 'number' &&
    typeof o.size === 'number' &&
    typeof o.total === 'number'
  )
}

export function unwrapCursor<T>(page: unknown): CursorPage<T> {
  if (!isCursorPage<T>(page)) {
    throw new ApiError({
      status: 0,
      title: 'Invalid cursor page envelope',
      code: 'INVALID_ENVELOPE',
    })
  }
  return { items: page.items, nextCursor: page.nextCursor, hasMore: page.hasMore }
}

export function unwrapOffset<T>(page: unknown): OffsetPage<T> {
  if (!isOffsetPage<T>(page)) {
    throw new ApiError({
      status: 0,
      title: 'Invalid offset page envelope',
      code: 'INVALID_ENVELOPE',
    })
  }
  return { items: page.items, page: page.page, size: page.size, total: page.total }
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports — keep call sites import-stable.
// ─────────────────────────────────────────────────────────────────────────────

export { ApiError, isApiError, isNetworkApiError } from './apiError'
export type { ProblemDetail }
