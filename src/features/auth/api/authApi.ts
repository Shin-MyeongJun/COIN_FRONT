/**
 * Backend Auth REST calls.
 *
 * Path constants live here (the feature-level *Api.ts pattern); components
 * MUST NOT hardcode `/api/v1/auth/...` anywhere else.
 *
 * - signup/login/refresh are PUBLIC (auth:false) — they should not send a
 *   stale Bearer token. Refresh additionally relies on the httpOnly cookie
 *   being attached automatically by `credentials:'include'`.
 * - logout/me require a valid bearer (default auth:true).
 */

import { getJson, postJson } from '@/shared/api/httpClient'
import type {
  LoginRequest,
  MeResponse,
  SignupRequest,
  SignupResponse,
  TokenResponse,
} from './authTypes'

export const authApiPaths = {
  signup: '/api/v1/auth/signup',
  login: '/api/v1/auth/login',
  refresh: '/api/v1/auth/refresh',
  logout: '/api/v1/auth/logout',
  me: '/api/v1/auth/me',
  sseTicket: '/api/v1/auth/sse-ticket',
} as const

export function signup(body: SignupRequest): Promise<SignupResponse> {
  return postJson<SignupResponse, SignupRequest>(authApiPaths.signup, body, { auth: false })
}

export function login(body: LoginRequest): Promise<TokenResponse> {
  return postJson<TokenResponse, LoginRequest>(authApiPaths.login, body, { auth: false })
}

/** Refresh uses the httpOnly cookie — no request body, no bearer. */
export function refresh(): Promise<TokenResponse> {
  return postJson<TokenResponse, undefined>(authApiPaths.refresh, undefined, { auth: false })
}

export function logout(): Promise<void> {
  return postJson<void, undefined>(authApiPaths.logout, undefined)
}

export function me(): Promise<MeResponse> {
  return getJson<MeResponse>(authApiPaths.me)
}

/** Single-use SSE ticket for the alerts stream (EventSource can't send headers). */
export function fetchSseTicket(): Promise<{ ticket: string; expiresAt: number }> {
  return postJson<{ ticket: string; expiresAt: number }, undefined>(
    authApiPaths.sseTicket,
    undefined,
  )
}
