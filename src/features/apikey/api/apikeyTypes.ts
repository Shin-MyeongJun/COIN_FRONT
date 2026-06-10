/**
 * Backend ApiKey DTO mirror.
 *
 * Endpoints (all JWT-only, ApiKey principal rejected):
 *   POST   /api/v1/api-keys           — issue (secret exposed ONCE in response)
 *   GET    /api/v1/api-keys           — summary list (secret never returned)
 *   GET    /api/v1/api-keys/{id}      — single summary
 *   DELETE /api/v1/api-keys/{id}      — revoke
 *   GET    /api/v1/api-keys/{id}/usage — request counters
 *
 * Important contract notes:
 *   - `scopes` are the canonical 4-enum (see `@/shared/lib/apiKeyScopes`).
 *   - `secret` only appears in `IssueApiKeyResponse`. Anywhere else the field
 *     is intentionally absent — DO NOT persist or re-display it after issue.
 *   - Timestamps are epoch milliseconds (UTC).
 */

import type { ApiKeyScope } from '@/shared/lib/apiKeyScopes'

export interface ApiKeySummaryDto {
  id: number
  label: string
  /** Public prefix used as a UI identifier (e.g. "cd_live_xk7m"). */
  prefix: string
  scopes: ApiKeyScope[]
  ipRestriction: string | null
  active: boolean
  createdAt: number
  lastUsedAt: number | null
  dailyRequests: number
  dailyLimit: number
}

export interface IssueApiKeyRequest {
  label: string
  scopes: ApiKeyScope[]
  ipRestriction?: string | null
}

/**
 * Backend response right after creation.
 *
 * `secret` is the ONLY field that is never returned again — it must be shown
 * to the user once and then dropped from memory.
 */
export interface IssueApiKeyResponse {
  summary: ApiKeySummaryDto
  apiKey: string
  secret: string
}

export interface ApiKeyUsageDto {
  apiKeyId: number
  windowStart: number
  windowEnd: number
  totalRequests: number
  rateLimited: number
}
