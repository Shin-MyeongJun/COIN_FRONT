/**
 * Single source of truth for backend endpoint paths.
 *
 * Components/pages MUST NOT hardcode API paths — always import from here.
 * Dynamic path segments are exposed as functions to keep typing tight.
 *
 * Status legend:
 *   ✅ implemented on backend (publicRead=true reachable)
 *   🔒 implemented on backend, auth required (JWT or API key)
 *   🚧 not yet implemented on backend — mocked in-frontend
 */

// ─────────────────────────────────────────────────────────────────────────────
// Implemented endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  market: {
    // ✅ GET /api/v1/market/premium/ranking
    premiumRanking: '/api/v1/market/premium/ranking',
    // ✅ GET /api/v1/market/premium/snapshot/{base}
    premiumSnapshot: (base: string) => `/api/v1/market/premium/snapshot/${base}`,
    // ✅ GET /api/v1/market/premium/series
    premiumSeries: '/api/v1/market/premium/series',
    // ✅ GET /api/v1/market/ticks/latest
    ticksLatest: '/api/v1/market/ticks/latest',
  },
  compose: {
    // ✅ GET /api/v1/compose/chart/{id}
    chart: (marketCodeId: number) => `/api/v1/compose/chart/${marketCodeId}`,
    // ✅ GET /api/v1/compose/market-overview/{id}
    marketOverview: (marketCodeId: number) =>
      `/api/v1/compose/market-overview/${marketCodeId}`,
  },
  economic: {
    // ✅ GET /api/v1/economic/calendar
    calendar: '/api/v1/economic/calendar',
    // ✅ GET /api/v1/economic/indicators
    indicators: '/api/v1/economic/indicators',
    // ✅ GET /api/v1/economic/correlation
    correlation: '/api/v1/economic/correlation',
  },
  stream: {
    // ✅ GET /api/v1/stream/ticks (SSE)
    ticks: '/api/v1/stream/ticks',
    // ✅ GET /api/v1/stream/premium (SSE)
    premium: '/api/v1/stream/premium',
    // ✅ GET /api/v1/stream/premium-detail/raw (SSE)
    premiumDetailRaw: '/api/v1/stream/premium-detail/raw',
    // ✅ GET /api/v1/stream/candles/close (SSE)
    candlesClose: '/api/v1/stream/candles/close',
    // ✅ GET /api/v1/stream/indicators/close (SSE)
    indicatorsClose: '/api/v1/stream/indicators/close',
    // 🔒 GET /api/v1/stream/alerts (SSE, ticket or access_token in query)
    alerts: '/api/v1/stream/alerts',
  },
  auth: {
    // ✅ POST /api/v1/auth/signup
    signup: '/api/v1/auth/signup',
    // ✅ POST /api/v1/auth/login
    login: '/api/v1/auth/login',
    // ✅ POST /api/v1/auth/refresh
    refresh: '/api/v1/auth/refresh',
    // 🔒 POST /api/v1/auth/logout
    logout: '/api/v1/auth/logout',
    // 🔒 GET  /api/v1/auth/me
    me: '/api/v1/auth/me',
    // 🔒 POST /api/v1/auth/sse-ticket
    sseTicket: '/api/v1/auth/sse-ticket',
  },
  apiKeys: {
    // 🔒 GET    /api/v1/api-keys
    list: '/api/v1/api-keys',
    // 🔒 POST   /api/v1/api-keys
    create: '/api/v1/api-keys',
    // 🔒 GET/DELETE /api/v1/api-keys/{id}
    item: (id: number) => `/api/v1/api-keys/${id}`,
    // 🔒 GET    /api/v1/api-keys/{id}/usage
    usage: (id: number) => `/api/v1/api-keys/${id}/usage`,
  },
  watchlist: {
    // 🔒 GET/POST /api/v1/watchlist (offset 페이징)
    list: '/api/v1/watchlist',
    // 🔒 DELETE /api/v1/watchlist/{id}
    item: (id: number) => `/api/v1/watchlist/${id}`,
  },
  alert: {
    // 🔒 GET/POST /api/v1/alert/rules (offset 페이징)
    rules: '/api/v1/alert/rules',
    // 🔒 GET/PUT/DELETE /api/v1/alert/rules/{id}
    rule: (id: number) => `/api/v1/alert/rules/${id}`,
    // 🔒 POST /api/v1/alert/rules/{id}/{enable|disable}
    ruleEnable: (id: number) => `/api/v1/alert/rules/${id}/enable`,
    ruleDisable: (id: number) => `/api/v1/alert/rules/${id}/disable`,
    // 🔒 GET /api/v1/alert/firings (cursor 페이징)
    firings: '/api/v1/alert/firings',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Not-yet-implemented endpoints (frontend uses mocks for these).
// Listed here so paths are discoverable once the backend modules land.
// ─────────────────────────────────────────────────────────────────────────────

export const UNIMPLEMENTED_ENDPOINTS = {} as const

// ─────────────────────────────────────────────────────────────────────────────
// SSE event keys (kept here so they stay paired with the stream paths).
// Event names follow the backend convention exactly — DO NOT rename.
// ─────────────────────────────────────────────────────────────────────────────

export const SSE_EVENT_KEYS = {
  connected: 'connected',
  tick: 'tick',
  premium: 'premium',
  premiumDetail: 'premium-detail',
  tickCandle: 'tick-candle',
  premiumCandle: 'premium-candle',
  premiumDetailCandle: 'premium-detail-candle',
  tickIndicator: 'tick-indicator',
  premiumIndicator: 'premium-indicator',
  alertFiring: 'alert-firing',
} as const

export type SseEventKey = (typeof SSE_EVENT_KEYS)[keyof typeof SSE_EVENT_KEYS]
