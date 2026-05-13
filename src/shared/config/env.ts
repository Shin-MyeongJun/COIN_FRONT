export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  useMockExternal: import.meta.env.VITE_USE_MOCK_EXTERNAL === 'true',
  appName: import.meta.env.VITE_APP_NAME ?? 'CoinData',
  defaultTheme: (import.meta.env.VITE_DEFAULT_THEME ?? 'dark') as 'dark' | 'light',
}
