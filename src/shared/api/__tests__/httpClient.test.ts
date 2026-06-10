import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  getJson,
  isApiError,
  isNetworkApiError,
  isCursorPage,
  isOffsetPage,
  postJson,
  unwrapCursor,
  unwrapOffset,
} from '../httpClient'
import { clearAccessToken, setAccessToken } from '../authToken'

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>

const originalFetch = globalThis.fetch

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>): FetchMock {
  const fn = vi.fn(impl) as FetchMock
  globalThis.fetch = fn as unknown as typeof fetch
  return fn
}

function problemResponse(problem: {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
}): Response {
  return new Response(JSON.stringify({ type: 'about:blank', ...problem }), {
    status: problem.status,
    headers: { 'Content-Type': 'application/problem+json' },
  })
}

describe('httpClient', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('parses application/problem+json into ApiError with status / title / detail / code', async () => {
    mockFetch(async () =>
      problemResponse({
        type: 'https://errors.coindata.io/market/not-found',
        title: 'Market not found',
        status: 404,
        detail: 'No market with id=42',
        instance: '/api/v1/market/premium/snapshot/BTC',
      }),
    )

    let caught: unknown = null
    try {
      await getJson('/api/v1/market/premium/snapshot/BTC')
    } catch (e) {
      caught = e
    }

    expect(isApiError(caught)).toBe(true)
    const err = caught as ApiError
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(404)
    expect(err.title).toBe('Market not found')
    expect(err.detail).toBe('No market with id=42')
    expect(err.code).toBe('https://errors.coindata.io/market/not-found')
    expect(err.problem?.instance).toBe('/api/v1/market/premium/snapshot/BTC')
    expect(err.message).toContain('Market not found')
    expect(err.message).toContain('404')
  })

  it('falls back to a synthetic ProblemDetail when the body is not problem+json', async () => {
    mockFetch(
      async () =>
        new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'text/plain' },
        }),
    )

    await expect(getJson('/api/v1/anything')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      title: 'Internal Server Error',
      detail: 'Internal Server Error',
    })
  })

  it('returns parsed JSON on 200 responses', async () => {
    mockFetch(
      async () =>
        new Response(JSON.stringify({ ok: true, value: 42 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const body = await getJson<{ ok: boolean; value: number }>('/api/v1/ping')
    expect(body).toEqual({ ok: true, value: 42 })
  })

  it('returns undefined on 204 No Content', async () => {
    mockFetch(async () => new Response(null, { status: 204 }))
    const body = await getJson<undefined>('/api/v1/empty')
    expect(body).toBeUndefined()
  })

  it('translates fetch failure into ApiError(status:0, code:NETWORK)', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch')
    })

    let caught: unknown = null
    try {
      await getJson('/api/v1/down')
    } catch (e) {
      caught = e
    }

    expect(isApiError(caught)).toBe(true)
    expect(isNetworkApiError(caught)).toBe(true)
    const err = caught as ApiError
    expect(err.status).toBe(0)
    expect(err.code).toBe('NETWORK')
  })

  it('attaches Authorization header when a token is set and auth is not disabled', async () => {
    setAccessToken('test-token-xyz')
    const fetchMock = mockFetch(
      async () =>
        new Response('{}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    await getJson('/api/v1/auth/me')

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const headers = init?.headers as Record<string, string> | undefined
    expect(headers?.Authorization).toBe('Bearer test-token-xyz')
    expect(init?.credentials).toBe('include')
  })

  it('omits Authorization header when auth:false', async () => {
    setAccessToken('test-token-xyz')
    const fetchMock = mockFetch(
      async () =>
        new Response('{}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    await getJson('/api/v1/public/things', undefined, { auth: false })

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const headers = init?.headers as Record<string, string> | undefined
    expect(headers?.Authorization).toBeUndefined()
  })

  it('serializes JSON body on postJson', async () => {
    const fetchMock = mockFetch(
      async () =>
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    await postJson<{ id: number }>('/api/v1/things', { name: 'x' })

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ name: 'x' }))
    const headers = init?.headers as Record<string, string> | undefined
    expect(headers?.['Content-Type']).toBe('application/json')
  })

  it('treats application/problem+json on a 2xx as an error too', async () => {
    mockFetch(
      async () =>
        new Response(
          JSON.stringify({ type: 'soft-fail', title: 'Soft fail', status: 200 }),
          { status: 200, headers: { 'Content-Type': 'application/problem+json' } },
        ),
    )

    await expect(getJson('/api/v1/whatever')).rejects.toBeInstanceOf(ApiError)
  })
})

describe('paging envelope helpers', () => {
  it('isCursorPage / unwrapCursor accept a valid cursor envelope', () => {
    const page = { items: [1, 2, 3], nextCursor: 1700000000000, hasMore: true }
    expect(isCursorPage<number>(page)).toBe(true)
    expect(unwrapCursor<number>(page)).toEqual(page)
  })

  it('isOffsetPage / unwrapOffset accept a valid offset envelope', () => {
    const page = { items: ['a'], page: 0, size: 20, total: 1 }
    expect(isOffsetPage<string>(page)).toBe(true)
    expect(unwrapOffset<string>(page)).toEqual(page)
  })

  it('unwrapCursor throws ApiError on an invalid envelope', () => {
    expect(() => unwrapCursor<number>({ foo: 1 })).toThrow(ApiError)
  })

  it('unwrapOffset throws ApiError on an invalid envelope', () => {
    expect(() => unwrapOffset<number>({ items: [], page: 'oops' })).toThrow(ApiError)
  })
})
