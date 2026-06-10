/**
 * In-memory access token holder.
 *
 * The HTTP client reads the bearer token from here on every request.
 * Auth slice / store writes via setAccessToken on login and clearAccessToken
 * on logout. The refresh token lives in an httpOnly cookie (set by the
 * backend) and is sent automatically via `credentials: 'include'`.
 *
 * Deliberately a plain module variable — NOT a Zustand store — so the
 * shared/api layer has zero dependency on the auth feature.
 */

let accessToken: string | undefined

export function getAccessToken(): string | undefined {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = undefined
}

export function hasAccessToken(): boolean {
  return accessToken !== undefined
}
