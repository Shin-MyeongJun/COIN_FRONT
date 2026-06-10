/**
 * Auth state store.
 *
 * ── Refresh-token strategy (decision recorded here) ───────────────────────
 * Backend code is not vendored in this repo, so the decision below was made
 * against the [백엔드 계약] in the task brief, which specifies private JWT
 * endpoints and an `/auth/sse-ticket` flow. The agreed design between front
 * and back is:
 *
 *   - access token  → returned in the JSON body of /auth/{login,refresh},
 *                     held in MEMORY (authToken module). Never persisted.
 *   - refresh token → issued by backend as an httpOnly Set-Cookie. Browser
 *                     attaches it automatically on /auth/refresh because
 *                     httpClient sends `credentials:'include'`. Frontend
 *                     never reads it directly.
 *
 * If the backend turns out to return the refresh token in the response BODY
 * (legacy/bad path), this assumption is wrong — fix the backend first; do
 * NOT add localStorage storage for the refresh token here.
 *
 * ── Persistence ───────────────────────────────────────────────────────────
 * localStorage only stores a non-sensitive boolean hint ("has-session=1")
 * so the bootstrap UI can show "checking…" instead of flashing /login on
 * reload. The actual session truth still comes from /auth/refresh + /auth/me.
 */

import { create } from 'zustand'
import * as authApi from '@/features/auth/api/authApi'
import type { MeResponse } from '@/features/auth/api/authTypes'
import { isApiError } from '@/shared/api/apiError'
import { clearAccessToken, setAccessToken } from '@/shared/api/authToken'
import { storage } from '@/shared/lib/storage'

const SESSION_HINT_KEY = 'coindata:auth:has-session'

export type AuthStatus =
  | 'idle' // initial — bootstrap() has not run yet
  | 'bootstrapping' // /auth/refresh + /auth/me in flight
  | 'authenticated'
  | 'unauthenticated'

type AuthState = {
  user: MeResponse | null
  status: AuthStatus
  /** Mirror of `status === 'authenticated'` for terse selectors in components. */
  isAuthenticated: boolean
  /** Last auth error message (login failure etc.) for UI surfacing. */
  lastError: string | null

  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signup: (input: { email: string; password: string; name: string }) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

function hasSessionHint(): boolean {
  return storage.getString(SESSION_HINT_KEY) === '1'
}

function setSessionHint(on: boolean): void {
  if (on) storage.setString(SESSION_HINT_KEY, '1')
  else storage.remove(SESSION_HINT_KEY)
}

function describeError(err: unknown): string {
  if (isApiError(err)) {
    if (err.code === 'NETWORK') return '서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'
    if (err.status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.'
    return err.detail ?? err.title
  }
  if (err instanceof Error) return err.message
  return '알 수 없는 오류가 발생했습니다.'
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  // If the hint says we had a session, hold the UI in 'bootstrapping' so
  // ProtectedRoute doesn't flash a redirect to /login before refresh resolves.
  status: hasSessionHint() ? 'bootstrapping' : 'unauthenticated',
  isAuthenticated: false,
  lastError: null,

  bootstrap: async () => {
    if (get().status === 'authenticated') return
    set({ status: 'bootstrapping', lastError: null })
    try {
      const tokens = await authApi.refresh()
      setAccessToken(tokens.accessToken)
      const user = await authApi.me()
      setSessionHint(true)
      set({ user, status: 'authenticated', isAuthenticated: true })
    } catch {
      // Refresh failed (no cookie / expired / backend down) — treat as logged out.
      clearAccessToken()
      setSessionHint(false)
      set({ user: null, status: 'unauthenticated', isAuthenticated: false })
    }
  },

  login: async (email, password) => {
    set({ lastError: null })
    try {
      const tokens = await authApi.login({ email, password })
      setAccessToken(tokens.accessToken)
      const user = await authApi.me()
      setSessionHint(true)
      set({ user, status: 'authenticated', isAuthenticated: true })
    } catch (err) {
      // If /auth/me failed after a successful /auth/login, the cookie may
      // still be valid — but we won't trust a half-baked session.
      clearAccessToken()
      setSessionHint(false)
      set({
        user: null,
        status: 'unauthenticated',
        isAuthenticated: false,
        lastError: describeError(err),
      })
      throw err
    }
  },

  signup: async (input) => {
    set({ lastError: null })
    try {
      await authApi.signup(input)
    } catch (err) {
      set({ lastError: describeError(err) })
      throw err
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the backend call fails (network down, already-revoked token),
      // clear local state — leaving an authenticated UI tied to a dead session
      // is worse than a redundant clear.
    }
    clearAccessToken()
    setSessionHint(false)
    set({ user: null, status: 'unauthenticated', isAuthenticated: false, lastError: null })
  },

  clearError: () => set({ lastError: null }),
}))

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectIsAuthenticated = (s: AuthState): boolean => s.isAuthenticated
export const selectAuthStatus = (s: AuthState): AuthStatus => s.status
export const selectUser = (s: AuthState): MeResponse | null => s.user
