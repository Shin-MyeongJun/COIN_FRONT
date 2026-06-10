/**
 * Backend ApiKeyScope (canonical 4-enum). Single source of truth.
 *
 * Replaces the legacy 6-string mock set (market:read, analytics:read,
 * economic:read, stream:subscribe, watchlist:write, alert:write) — DO NOT
 * reintroduce those strings anywhere.
 *
 * If the backend ever adds/removes a scope, only this file changes. The
 * api-key picker and any policy display reads `API_KEY_SCOPES` from here.
 */

export type ApiKeyScope =
  | 'READ_MARKET'
  | 'READ_ANALYTICS'
  | 'READ_PRIVATE'
  | 'SSE_STREAM'

export interface ApiKeyScopeDescriptor {
  id: ApiKeyScope
  label: string
  description: string
}

/**
 * Order here drives display order in the scope picker.
 * Keep it stable so existing screenshots / docs stay accurate.
 */
export const API_KEY_SCOPES: readonly ApiKeyScopeDescriptor[] = [
  {
    id: 'READ_MARKET',
    label: 'READ_MARKET',
    description: '마켓/틱/김프/FX 등 공개 마켓 데이터 조회',
  },
  {
    id: 'READ_ANALYTICS',
    label: 'READ_ANALYTICS',
    description: '캔들/지표/경제지표 등 분석 데이터 조회',
  },
  {
    id: 'READ_PRIVATE',
    label: 'READ_PRIVATE',
    description: '워치리스트/알람 등 사용자 전용 리소스 조회',
  },
  {
    id: 'SSE_STREAM',
    label: 'SSE_STREAM',
    description: '실시간 SSE 스트림 구독',
  },
] as const

const SCOPE_ID_SET = new Set<ApiKeyScope>(API_KEY_SCOPES.map((s) => s.id))

/** Narrow an unknown string (from a backend response) to a known ApiKeyScope. */
export function isApiKeyScope(value: string): value is ApiKeyScope {
  return SCOPE_ID_SET.has(value as ApiKeyScope)
}
