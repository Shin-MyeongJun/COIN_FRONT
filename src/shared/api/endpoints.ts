export const API = {
  meta: {
    exchanges: '/api/v1/meta/exchanges',
    marketsByExchange: (id: number) => `/api/v1/meta/exchanges/${id}/markets`,
    marketSearch: '/api/v1/meta/markets/search',
  },
  market: {
    tickLatest: (id: number) => `/api/v1/market/ticks/latest/${id}`,
    tickLatestBulk: '/api/v1/market/ticks/latest',
    premiumSnapshot: (base: string) => `/api/v1/market/premium/snapshot/${base}`,
    premiumRanking: '/api/v1/market/premium/ranking',
    premiumSeries: '/api/v1/market/premium/series',
    fxLatest: '/api/v1/market/fx/latest',
  },
  analytics: {
    candles: '/api/v1/analytics/candles',
    candlesMini: '/api/v1/analytics/candles/mini',
    candlesDownsampled: '/api/v1/analytics/candles/downsampled',
    indicators: '/api/v1/analytics/indicators',
    indicatorsLatest: '/api/v1/analytics/indicators/latest',
    indicatorsLatestMulti: '/api/v1/analytics/indicators/latest/multi',
    screener: '/api/v1/analytics/screener',
  },
  economic: {
    series: (codeId: number) => `/api/v1/economic/indicators/${codeId}/series`,
    calendar: '/api/v1/economic/calendar',
    indicatorMeta: (codeId: number) => `/api/v1/economic/indicators/${codeId}`,
    indicators: '/api/v1/economic/indicators',
    changeRate: (codeId: number) => `/api/v1/economic/indicators/${codeId}/change-rate`,
    correlation: '/api/v1/economic/correlation',
  },
  compose: {
    marketOverview: (id: number) => `/api/v1/compose/market-overview/${id}`,
    chart: (id: number) => `/api/v1/compose/chart/${id}`,
    dashboard: '/api/v1/compose/dashboard',
  },
  stream: {
    ticks: '/api/v1/stream/ticks',
    premium: '/api/v1/stream/premium',
    candlesClose: '/api/v1/stream/candles/close',
    indicatorsClose: '/api/v1/stream/indicators/close',
  },
  alert: {
    rules: '/api/v1/alert/rules',
    rule: (id: number) => `/api/v1/alert/rules/${id}`,
    firings: '/api/v1/alert/firings',
  },
  watchlist: {
    list: '/api/v1/watchlist',
    item: (id: number) => `/api/v1/watchlist/${id}`,
  },
  auth: {
    login: '/api/v1/auth/login',
    signup: '/api/v1/auth/signup',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
  },
  apikey: {
    list: '/api/v1/api-keys',
    create: '/api/v1/api-keys',
    item: (id: number) => `/api/v1/api-keys/${id}`,
    usage: (id: number) => `/api/v1/api-keys/${id}/usage`,
  },
} as const
