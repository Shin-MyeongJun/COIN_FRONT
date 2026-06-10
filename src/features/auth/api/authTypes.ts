/**
 * Backend Auth DTO mirror.
 *
 * Field names mirror the backend's TokenResponse / MeResponse exactly.
 * Timestamps are epoch milliseconds (UTC). AccountTier is the canonical
 * 3-value enum agreed in the backend contract.
 *
 * Refresh tokens are NOT carried in any body in this file — the backend
 * issues them as an httpOnly cookie that the browser sends automatically.
 */

export type AccountTier = 'FREE' | 'PRO' | 'ADMIN'

// ── Signup ────────────────────────────────────────────────────────────────

export type SignupRequest = {
  email: string
  password: string
  /** Display name shown across the dashboard. */
  name: string
}

export type SignupResponse = {
  userId: number
  email: string
  createdAt: number
}

// ── Login / Refresh ───────────────────────────────────────────────────────

export type LoginRequest = {
  email: string
  password: string
}

/**
 * Auth/login and Auth/refresh share this shape.
 * - `accessToken` is what the frontend holds in memory and sends as `Authorization: Bearer …`.
 * - `tokenType` is informational; always 'Bearer' per backend contract.
 * - `expiresIn` is seconds, used only for diagnostic logging.
 */
export type TokenResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

// ── Me ────────────────────────────────────────────────────────────────────

export type MeResponse = {
  id: number
  email: string
  name: string
  tier: AccountTier
  createdAt: number
}
