/**
 * Alert REST surface (rules + firings).
 *
 * All calls are private (JWT-only). Path constants come from
 * `API_ENDPOINTS.alert` — components MUST NOT hardcode these paths.
 *
 * Mock fallback (env.useMock=true): an in-memory store keeps the UI usable
 * without a backend. The mock honors the same envelope shapes and channel
 * names so the page code does not branch on `env.useMock`.
 */

import { API_ENDPOINTS } from '@/shared/api/endpoints'
import { del, getJson, postJson, putJson } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'
import type { CursorPage, OffsetPage } from '@/shared/api/types'
import type {
  AlertChannel,
  AlertFiringDto,
  AlertRuleDto,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest,
} from './alertTypes'

export const alertApiPaths = API_ENDPOINTS.alert

// ── Real backend calls ─────────────────────────────────────────────────────

export function fetchAlertRules(params: {
  page: number
  size: number
}): Promise<OffsetPage<AlertRuleDto>> {
  if (env.useMock) return Promise.resolve(mockRulesPage(params))
  return getJson<OffsetPage<AlertRuleDto>>(alertApiPaths.rules, {
    page: params.page,
    size: params.size,
  })
}

export function fetchAlertRule(id: number): Promise<AlertRuleDto> {
  if (env.useMock) return Promise.resolve(mockGetRule(id))
  return getJson<AlertRuleDto>(alertApiPaths.rule(id))
}

export function createAlertRule(body: CreateAlertRuleRequest): Promise<AlertRuleDto> {
  if (env.useMock) return Promise.resolve(mockCreate(body))
  return postJson<AlertRuleDto, CreateAlertRuleRequest>(alertApiPaths.rules, body)
}

export function updateAlertRule(
  id: number,
  body: UpdateAlertRuleRequest,
): Promise<AlertRuleDto> {
  if (env.useMock) return Promise.resolve(mockUpdate(id, body))
  return putJson<AlertRuleDto, UpdateAlertRuleRequest>(alertApiPaths.rule(id), body)
}

export function deleteAlertRule(id: number): Promise<void> {
  if (env.useMock) {
    mockDelete(id)
    return Promise.resolve()
  }
  return del<void>(alertApiPaths.rule(id))
}

export function enableAlertRule(id: number): Promise<AlertRuleDto> {
  if (env.useMock) return Promise.resolve(mockSetActive(id, true))
  return postJson<AlertRuleDto, undefined>(alertApiPaths.ruleEnable(id), undefined)
}

export function disableAlertRule(id: number): Promise<AlertRuleDto> {
  if (env.useMock) return Promise.resolve(mockSetActive(id, false))
  return postJson<AlertRuleDto, undefined>(alertApiPaths.ruleDisable(id), undefined)
}

export function fetchAlertFirings(params: {
  cursor?: number
  limit: number
}): Promise<CursorPage<AlertFiringDto>> {
  if (env.useMock) return Promise.resolve(mockFiringsPage(params))
  return getJson<CursorPage<AlertFiringDto>>(alertApiPaths.firings, {
    cursor: params.cursor,
    limit: params.limit,
  })
}

// ── Mock store (env.useMock=true only) ─────────────────────────────────────

const NOW = Date.now()
const DEFAULT_CHANNELS: AlertChannel[] = ['SSE']

let mockRules: AlertRuleDto[] = [
  {
    id: 1, userId: 1, label: 'BTC 김프 폭발', targetType: 'PREMIUM',
    targetIdentifiers: ['BTC'], metric: 'BUY_PREMIUM_RATE',
    operator: '>', threshold: '5', cooldownSec: 60,
    channels: ['SSE', 'EMAIL'], active: true,
    createdAt: NOW - 7 * 86_400_000, updatedAt: NOW - 7 * 86_400_000,
  },
  {
    id: 2, userId: 1, label: 'ETH 매도 프리미엄', targetType: 'PREMIUM',
    targetIdentifiers: ['ETH'], metric: 'SELL_PREMIUM_RATE',
    operator: '>', threshold: '4.5', cooldownSec: 120,
    channels: ['SSE'], active: true,
    createdAt: NOW - 3 * 86_400_000, updatedAt: NOW - 3 * 86_400_000,
  },
  {
    id: 3, userId: 1, label: 'SOL 김프 급등', targetType: 'PREMIUM',
    targetIdentifiers: ['SOL'], metric: 'BUY_PREMIUM_RATE',
    operator: '>', threshold: '4', cooldownSec: 300,
    channels: ['SSE', 'DISCORD'], active: true,
    createdAt: NOW - 86_400_000, updatedAt: NOW - 86_400_000,
  },
  {
    id: 4, userId: 1, label: 'XRP 프리미엄 하락', targetType: 'PREMIUM',
    targetIdentifiers: ['XRP'], metric: 'BUY_PREMIUM_RATE',
    operator: '<', threshold: '2', cooldownSec: 60,
    channels: ['SSE'], active: false,
    createdAt: NOW - 14 * 86_400_000, updatedAt: NOW - 14 * 86_400_000,
  },
]
let mockRuleNextId = mockRules.length + 1

let mockFirings: AlertFiringDto[] = [
  { id: 1, ruleId: 1, ruleLabel: 'BTC 김프 폭발', metric: 'BUY_PREMIUM_RATE', threshold: '5', observedValue: '5.21', firedAt: NOW - 180_000 },
  { id: 2, ruleId: 2, ruleLabel: 'ETH 매도 프리미엄', metric: 'SELL_PREMIUM_RATE', threshold: '4.5', observedValue: '4.71', firedAt: NOW - 600_000 },
  { id: 3, ruleId: 3, ruleLabel: 'SOL 김프 급등', metric: 'BUY_PREMIUM_RATE', threshold: '4', observedValue: '4.03', firedAt: NOW - 1_800_000 },
  { id: 4, ruleId: 4, ruleLabel: 'XRP 프리미엄 하락', metric: 'BUY_PREMIUM_RATE', threshold: '2', observedValue: '1.88', firedAt: NOW - 3_600_000 },
]

function mockRulesPage(p: { page: number; size: number }): OffsetPage<AlertRuleDto> {
  const sorted = [...mockRules].sort((a, b) => b.updatedAt - a.updatedAt)
  const start = p.page * p.size
  return {
    items: sorted.slice(start, start + p.size),
    page: p.page,
    size: p.size,
    total: mockRules.length,
  }
}

function mockGetRule(id: number): AlertRuleDto {
  const found = mockRules.find((r) => r.id === id)
  if (found === undefined) {
    throw new Error(`Mock: rule ${id} not found`)
  }
  return found
}

function mockCreate(body: CreateAlertRuleRequest): AlertRuleDto {
  const ts = Date.now()
  const created: AlertRuleDto = {
    ...body,
    id: mockRuleNextId++,
    userId: 1,
    active: body.active ?? true,
    channels: body.channels.length > 0 ? body.channels : DEFAULT_CHANNELS,
    createdAt: ts,
    updatedAt: ts,
  }
  mockRules = [...mockRules, created]
  return created
}

function mockUpdate(id: number, body: UpdateAlertRuleRequest): AlertRuleDto {
  const existing = mockGetRule(id)
  const updated: AlertRuleDto = {
    ...existing,
    ...body,
    id: existing.id,
    userId: existing.userId,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  }
  mockRules = mockRules.map((r) => (r.id === id ? updated : r))
  return updated
}

function mockDelete(id: number): void {
  mockRules = mockRules.filter((r) => r.id !== id)
}

function mockSetActive(id: number, active: boolean): AlertRuleDto {
  const existing = mockGetRule(id)
  const updated = { ...existing, active, updatedAt: Date.now() }
  mockRules = mockRules.map((r) => (r.id === id ? updated : r))
  return updated
}

function mockFiringsPage(p: { cursor?: number; limit: number }): CursorPage<AlertFiringDto> {
  const sorted = [...mockFirings].sort((a, b) => b.firedAt - a.firedAt)
  const filtered = p.cursor === undefined ? sorted : sorted.filter((f) => f.firedAt < p.cursor!)
  const items = filtered.slice(0, p.limit)
  const last = items[items.length - 1]
  return {
    items,
    nextCursor: items.length === p.limit && last !== undefined ? last.firedAt : null,
    hasMore: items.length === p.limit,
  }
}
