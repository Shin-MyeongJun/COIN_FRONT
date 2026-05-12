import { env } from '../config/env'

export type QueryParams = Record<string, string | number | boolean | undefined | null>

export function buildApiUrl(path: string, params: QueryParams = {}) {
  const url = new URL(path, env.apiBaseUrl)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

export async function getJson<TResponse>(path: string, params?: QueryParams): Promise<TResponse> {
  const response = await fetch(buildApiUrl(path, params))

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<TResponse>
}
