/**
 * ApiKey React Query hooks.
 *
 * Issue/revoke mutations invalidate `queryKeys.apiKeys.all` so the list
 * refetches after every successful write. The issue response carries the
 * one-time secret — callers MUST consume it from the mutation result and
 * never persist it through React Query's cache (we don't put it in any
 * setQueryData call).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import type { ApiError } from '@/shared/api/apiError'
import {
  fetchApiKeyUsage,
  fetchApiKeys,
  issueApiKey,
  revokeApiKey,
} from './apikeyApi'
import type {
  ApiKeySummaryDto,
  ApiKeyUsageDto,
  IssueApiKeyRequest,
  IssueApiKeyResponse,
} from './apikeyTypes'

export function useApiKeysQuery() {
  return useQuery<ApiKeySummaryDto[], ApiError>({
    queryKey: queryKeys.apiKeys.list(),
    queryFn: () => fetchApiKeys(),
    staleTime: 30_000,
  })
}

export function useApiKeyUsageQuery(id: number | undefined) {
  return useQuery<ApiKeyUsageDto, ApiError>({
    queryKey:
      id !== undefined ? queryKeys.apiKeys.usage(id) : ['api-keys', 'usage', 'disabled'],
    queryFn: () => {
      if (id === undefined) throw new Error('id is required')
      return fetchApiKeyUsage(id)
    },
    enabled: id !== undefined,
    staleTime: 30_000,
  })
}

export function useIssueApiKeyMutation() {
  const qc = useQueryClient()
  return useMutation<IssueApiKeyResponse, ApiError, IssueApiKeyRequest>({
    mutationFn: (body) => issueApiKey(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.apiKeys.all }),
  })
}

export function useRevokeApiKeyMutation() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, { id: number }>({
    mutationFn: ({ id }) => revokeApiKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.apiKeys.all }),
  })
}
