/**
 * Type-safe wrapper around `import.meta.env`.
 *
 * Feature/page code MUST import from this module — never read `import.meta.env`
 * directly. This keeps env variables documented in one place and lets us
 * normalize / validate them at boot.
 */

type Theme = 'dark' | 'light'

type RawEnv = {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SSE_BASE_URL?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_USE_MOCK_EXTERNAL?: string
  readonly VITE_FINNHUB_API_KEY?: string
  readonly VITE_GOLDAPI_KEY?: string
  readonly VITE_DEFAULT_THEME?: string
  readonly VITE_APP_NAME?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
  readonly MODE?: string
}

const raw = import.meta.env as RawEnv

function readString(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  const v = readString(value)
  if (v === undefined) return fallback
  const lowered = v.toLowerCase()
  if (lowered === 'true' || lowered === '1') return true
  if (lowered === 'false' || lowered === '0') return false
  return fallback
}

function readRequired(name: keyof RawEnv, value: string | undefined): string {
  const v = readString(value)
  if (v === undefined) {
    throw new Error(
      `[env] Missing required environment variable "${name}". ` +
        `Copy .env.example to .env.local and fill it in.`,
    )
  }
  return v
}

function readTheme(value: string | undefined): Theme {
  const v = readString(value)?.toLowerCase()
  return v === 'light' ? 'light' : 'dark'
}

const useMock = readBoolean(raw.VITE_USE_MOCK, true)

// apiBaseUrl is required only when we will actually hit the backend.
// In mock mode we still expose a usable value so that any accidental call
// produces a recognizable URL during local development.
const apiBaseUrl = useMock
  ? readString(raw.VITE_API_BASE_URL) ?? 'http://localhost:8080'
  : readRequired('VITE_API_BASE_URL', raw.VITE_API_BASE_URL)

export const env = {
  apiBaseUrl,
  sseBaseUrl: readString(raw.VITE_SSE_BASE_URL) ?? apiBaseUrl,
  useMock,
  useMockExternal: readBoolean(raw.VITE_USE_MOCK_EXTERNAL, false),
  appName: readString(raw.VITE_APP_NAME) ?? 'CoinData',
  defaultTheme: readTheme(raw.VITE_DEFAULT_THEME),
  finnhubApiKey: readString(raw.VITE_FINNHUB_API_KEY),
  goldApiKey: readString(raw.VITE_GOLDAPI_KEY),
  isDev: raw.DEV === true,
  isProd: raw.PROD === true,
  mode: readString(raw.MODE) ?? 'development',
} as const

export type Env = typeof env
