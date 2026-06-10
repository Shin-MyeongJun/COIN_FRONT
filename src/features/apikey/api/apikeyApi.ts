/**
 * ApiKey REST surface (private — JWT-only).
 *
 * Paths come from `API_ENDPOINTS.apiKeys`; components MUST NOT hardcode them.
 *
 * Mock store (env.useMock=true) keeps the UI usable without a backend.
 * The mock matches the real envelopes so the page never branches on useMock.
 *
 * Secret handling: `IssueApiKeyResponse` is the only place a secret appears.
 * After the dialog closes, callers must discard the secret — there is no API
 * to fetch it back.
 */

import { API_ENDPOINTS } from '@/shared/api/endpoints'
import { del, getJson, postJson } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'
import type { ApiKeyScope } from '@/shared/lib/apiKeyScopes'
import type {
  ApiKeySummaryDto,
  ApiKeyUsageDto,
  IssueApiKeyRequest,
  IssueApiKeyResponse,
} from './apikeyTypes'

export const apikeyApiPaths = API_ENDPOINTS.apiKeys

// ── Real backend calls ─────────────────────────────────────────────────────

export function fetchApiKeys(): Promise<ApiKeySummaryDto[]> {
  if (env.useMock) return Promise.resolve(mockList())
  return getJson<ApiKeySummaryDto[]>(apikeyApiPaths.list)
}

export function fetchApiKeyUsage(id: number): Promise<ApiKeyUsageDto> {
  if (env.useMock) return Promise.resolve(mockUsage(id))
  return getJson<ApiKeyUsageDto>(apikeyApiPaths.usage(id))
}

export function issueApiKey(body: IssueApiKeyRequest): Promise<IssueApiKeyResponse> {
  if (env.useMock) return Promise.resolve(mockIssue(body))
  return postJson<IssueApiKeyResponse, IssueApiKeyRequest>(apikeyApiPaths.create, body)
}

export function revokeApiKey(id: number): Promise<void> {
  if (env.useMock) {
    mockRevoke(id)
    return Promise.resolve()
  }
  return del<void>(apikeyApiPaths.item(id))
}

// ── Mock store (env.useMock=true only) ─────────────────────────────────────

const NOW = Date.now()

let mockKeys: ApiKeySummaryDto[] = [
  {
    id: 1,
    label: 'trading-bot-prod',
    prefix: 'cd_live_xk7m',
    scopes: ['READ_MARKET', 'READ_ANALYTICS', 'SSE_STREAM'],
    ipRestriction: '203.0.113.42',
    active: true,
    createdAt: NOW - 60 * 86_400_000,
    lastUsedAt: NOW - 5 * 60_000,
    dailyRequests: 12_403,
    dailyLimit: 50_000,
  },
  {
    id: 2,
    label: 'personal-dashboard',
    prefix: 'cd_live_p9nq',
    scopes: ['READ_MARKET', 'READ_ANALYTICS'],
    ipRestriction: null,
    active: false,
    createdAt: NOW - 10 * 86_400_000,
    lastUsedAt: null,
    dailyRequests: 0,
    dailyLimit: 50_000,
  },
]
let mockNextId = mockKeys.length + 1

function mockList(): ApiKeySummaryDto[] {
  return [...mockKeys].sort((a, b) => b.createdAt - a.createdAt)
}

function mockUsage(id: number): ApiKeyUsageDto {
  const key = mockKeys.find((k) => k.id === id)
  const total = key?.dailyRequests ?? 0
  return {
    apiKeyId: id,
    windowStart: NOW - 86_400_000,
    windowEnd: NOW,
    totalRequests: total,
    rateLimited: Math.floor(total * 0.01),
  }
}

function randomHex(len: number): string {
  let out = ''
  for (let i = 0; i < len; i += 1) {
    out += Math.floor(Math.random() * 16).toString(16)
  }
  return out
}

function mockIssue(body: IssueApiKeyRequest): IssueApiKeyResponse {
  const apiKey = `cd_live_${randomHex(16)}`
  const secret = `cd_secret_${randomHex(40)}`
  const prefix = apiKey.slice(0, 12)
  const scopes: ApiKeyScope[] = [...body.scopes]
  const ts = Date.now()
  const summary: ApiKeySummaryDto = {
    id: mockNextId++,
    label: body.label,
    prefix,
    scopes,
    ipRestriction: body.ipRestriction ?? null,
    active: true,
    createdAt: ts,
    lastUsedAt: null,
    dailyRequests: 0,
    dailyLimit: 50_000,
  }
  mockKeys = [summary, ...mockKeys]
  return { summary, apiKey, secret }
}

function mockRevoke(id: number): void {
  mockKeys = mockKeys.filter((k) => k.id !== id)
}
