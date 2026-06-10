/**
 * Alert React Query hooks (rules + firings).
 *
 * Mutations invalidate `queryKeys.alert.all` so every list/detail view
 * refetches after a successful write. `useAlertRuleQuery` is a per-id
 * cache, useful for the detail/edit page even when the list query has
 * been paginated out of memory.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import type { CursorPage, OffsetPage } from '@/shared/api/types'
import {
  createAlertRule,
  deleteAlertRule,
  disableAlertRule,
  enableAlertRule,
  fetchAlertFirings,
  fetchAlertRule,
  fetchAlertRules,
  updateAlertRule,
} from './alertApi'
import type {
  AlertFiringDto,
  AlertRuleDto,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest,
} from './alertTypes'

const DEFAULT_RULES_PAGE_SIZE = 50
const DEFAULT_FIRINGS_LIMIT = 30

// ── Rules ──────────────────────────────────────────────────────────────────

export function useAlertRulesQuery(params: { page?: number; size?: number } = {}) {
  const page = params.page ?? 0
  const size = params.size ?? DEFAULT_RULES_PAGE_SIZE
  return useQuery<OffsetPage<AlertRuleDto>>({
    queryKey: queryKeys.alert.rules({ page, size }),
    queryFn: () => fetchAlertRules({ page, size }),
    staleTime: 30_000,
  })
}

export function useAlertRuleQuery(id: number | undefined) {
  return useQuery<AlertRuleDto>({
    queryKey: id !== undefined ? queryKeys.alert.rule(id) : ['alert', 'rule', 'disabled'],
    queryFn: () => {
      if (id === undefined) throw new Error('id is required')
      return fetchAlertRule(id)
    },
    enabled: id !== undefined,
    staleTime: 30_000,
  })
}

export function useCreateAlertRuleMutation() {
  const qc = useQueryClient()
  return useMutation<AlertRuleDto, unknown, CreateAlertRuleRequest>({
    mutationFn: (body) => createAlertRule(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.alert.all }),
  })
}

export function useUpdateAlertRuleMutation() {
  const qc = useQueryClient()
  return useMutation<AlertRuleDto, unknown, { id: number; body: UpdateAlertRuleRequest }>({
    mutationFn: ({ id, body }) => updateAlertRule(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.alert.all }),
  })
}

export function useDeleteAlertRuleMutation() {
  const qc = useQueryClient()
  return useMutation<void, unknown, { id: number }>({
    mutationFn: ({ id }) => deleteAlertRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.alert.all }),
  })
}

export function useToggleAlertRuleMutation() {
  const qc = useQueryClient()
  return useMutation<AlertRuleDto, unknown, { id: number; nextActive: boolean }>({
    mutationFn: ({ id, nextActive }) =>
      nextActive ? enableAlertRule(id) : disableAlertRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.alert.all }),
  })
}

// ── Firings ────────────────────────────────────────────────────────────────

export function useAlertFiringsQuery(params: { limit?: number } = {}) {
  const limit = params.limit ?? DEFAULT_FIRINGS_LIMIT
  return useQuery<CursorPage<AlertFiringDto>>({
    queryKey: queryKeys.alert.firings({ limit }),
    queryFn: () => fetchAlertFirings({ limit }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
