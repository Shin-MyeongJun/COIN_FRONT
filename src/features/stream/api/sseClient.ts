import { buildApiUrl, type QueryParams } from '../../../shared/api/httpClient'

export function createSseClient(path: string, params?: QueryParams) {
  return new EventSource(buildApiUrl(path, params))
}
