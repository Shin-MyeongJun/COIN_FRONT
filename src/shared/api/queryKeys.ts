/**
 * React Query key factory.
 *
 * Every cache key must come from here so we can invalidate by prefix
 * (e.g. invalidate `queryKeys.premium.all` after an action that affects
 * every premium-related query).
 *
 * All keys are `as const` tuples so React Query sees them as readonly.
 */

export type EconomicCalendarRange = { fromTs: number; toTs: number }

export const queryKeys = {
  // ── premium ────────────────────────────────────────────────────────────
  premium: {
    all: ['premium'] as const,
    ranking: (limit: number) => ['premium', 'ranking', limit] as const,
    snapshot: (base: string) => ['premium', 'snapshot', base] as const,
    series: (params: {
      baseExchangeId: number
      compareExchangeId: number
      symbol: string
      bucketSeconds: number
      fromTs: number
      toTs: number
    }) => ['premium', 'series', params] as const,
  },

  // ── compose (composite payloads) ───────────────────────────────────────
  compose: {
    all: ['compose'] as const,
    chart: (marketCodeId: number, interval: string, indicatorType?: string) =>
      ['compose', 'chart', marketCodeId, interval, indicatorType ?? null] as const,
    marketOverview: (marketCodeId: number) =>
      ['compose', 'market-overview', marketCodeId] as const,
    dashboard: (marketCodeIds: readonly number[]) =>
      ['compose', 'dashboard', [...marketCodeIds].sort((a, b) => a - b).join(',')] as const,
  },

  // ── economic ───────────────────────────────────────────────────────────
  economic: {
    all: ['economic'] as const,
    calendar: (range: EconomicCalendarRange) =>
      ['economic', 'calendar', range.fromTs, range.toTs] as const,
    // 캘린더 → TimelineMarker(ViewModel) 변환 결과 캐시. range로 식별.
    timeline: (range: EconomicCalendarRange) =>
      ['economic', 'timeline', range.fromTs, range.toTs] as const,
    // GET /economic/indicators (?category=)
    indicators: (category?: string) => ['economic', 'indicators', category ?? null] as const,
    indicatorMeta: (codeId: number) => ['economic', 'indicator', codeId] as const,
    indicatorSeries: (codeId: number, range: { fromTs: number; toTs: number }) =>
      ['economic', 'indicator', codeId, 'series', range.fromTs, range.toTs] as const,
    // GET /economic/correlation (?asset=)
    correlation: (asset: string) => ['economic', 'correlation', asset] as const,
  },

  // ── market (raw ticks / fx) ────────────────────────────────────────────
  market: {
    all: ['market'] as const,
    ticksLatest: (marketCodeIds: readonly number[]) =>
      ['market', 'ticks', 'latest', [...marketCodeIds].sort((a, b) => a - b).join(',')] as const,
  },

  // ── meta (exchanges / markets) ─────────────────────────────────────────
  meta: {
    all: ['meta'] as const,
    exchanges: () => ['meta', 'exchanges'] as const,
    marketsByExchange: (exchangeId: number) => ['meta', 'exchange', exchangeId, 'markets'] as const,
    marketSearch: (query: string) => ['meta', 'market-search', query] as const,
  },

  // ── auth ───────────────────────────────────────────────────────────────
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // ── api keys ───────────────────────────────────────────────────────────
  apiKeys: {
    all: ['api-keys'] as const,
    list: () => ['api-keys', 'list'] as const,
    usage: (id: number) => ['api-keys', id, 'usage'] as const,
  },

  // ── watchlist (private, offset paging) ─────────────────────────────────
  watchlist: {
    all: ['watchlist'] as const,
    list: (params: { page: number; size: number }) =>
      ['watchlist', 'list', params.page, params.size] as const,
  },

  // ── alerts (private) ───────────────────────────────────────────────────
  alert: {
    all: ['alert'] as const,
    rules: (params: { page: number; size: number }) =>
      ['alert', 'rules', params.page, params.size] as const,
    rule: (id: number) => ['alert', 'rule', id] as const,
    firings: (params: { limit: number }) => ['alert', 'firings', params.limit] as const,
  },
} as const

export type QueryKeys = typeof queryKeys
