# coin_front

Vite + React 19 + TypeScript frontend for the coin / premium analytics backend.

## Quick start

```bash
npm install
cp .env.example .env.local      # then edit VITE_API_BASE_URL if needed
npm run dev
```

By default `.env.example` ships with `VITE_USE_MOCK=true`, so the app runs end-to-end against in-memory mocks without a running backend.

## Environment variables

All variables live in `.env.local` (gitignored) and are exposed through the type-safe wrapper at `src/shared/config/env.ts`. **Do not** read `import.meta.env.*` directly from feature code.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | yes | `http://localhost:8080` | Backend base URL |
| `VITE_USE_MOCK` | no | `true` | Use in-memory mocks instead of HTTP |
| `VITE_USE_MOCK_EXTERNAL` | no | `true` | Mock Finnhub / GoldAPI / etc. |
| `VITE_SSE_BASE_URL` | no | falls back to `VITE_API_BASE_URL` | SSE stream base URL |
| `VITE_FINNHUB_API_KEY` | no | — | Local-only secret |
| `VITE_GOLDAPI_KEY` | no | — | Local-only secret |
| `VITE_DEFAULT_THEME` | no | `dark` | `dark` \| `light` |
| `VITE_APP_NAME` | no | `CoinData` | Header / document title |

### Never commit secrets

- `.env.local`, `.env.*.local`, and any file containing real API keys must stay out of git.
- The repository's `.gitignore` already excludes `.env.local`; verify with `git check-ignore .env.local` before adding new env files.
- For shared/CI configuration use `.env.example` (placeholders only — no values).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with React Query Devtools mounted |
| `npm run build` | `tsc` typecheck + `vite build` |
| `npm run typecheck` | `tsc --noEmit` only |
| `npm run test` | Vitest one-shot run |
| `npm run test:watch` | Vitest watch mode |

## Architecture (M0 onward)

```
src/
├─ app/                    # Providers, layout, routing
├─ features/{domain}/      # feature-based slices
│   ├─ api/    *Types.ts   # raw DTO types
│   │         *Api.ts      # endpoint callers
│   ├─ model/ *ViewTypes.ts  # ViewModel types
│   │         *Mappers.ts    # DTO → ViewModel
│   └─ components/         # UI for this feature only
├─ pages/                  # Route-level entry components
├─ shared/
│   ├─ api/
│   │   ├─ endpoints.ts    # SINGLE SOURCE OF TRUTH for backend paths
│   │   ├─ httpClient.ts   # fetch wrapper + ProblemDetail / refresh / timeout
│   │   ├─ queryKeys.ts    # React Query key factory
│   │   └─ types.ts        # ProblemDetail, CursorPage, OffsetPage
│   ├─ config/env.ts       # Type-safe env wrapper
│   ├─ lib/storage.ts      # localStorage wrapper (no direct access elsewhere)
│   └─ store/              # Cross-feature zustand stores
└─ lib/sse/                # SSE EventSource wrapper
```

### Conventions

1. **Feature-based** folders. Cross-feature code lives in `shared/`.
2. **DTO ↔ ViewModel separation**: never let raw `*Types.ts` shapes leak into components — map through `model/*Mappers.ts`.
3. **No hardcoded paths** in components. All backend endpoints go through `src/shared/api/endpoints.ts`.
4. **No direct `localStorage`**. Use `src/shared/lib/storage.ts`.
5. **No `any`**. `tsconfig` enables strict + `noImplicitAny`.
6. **BigDecimal-as-string** from backend. Display-only `Number(...)`; arithmetic uses `decimal.js` or string ops.
7. **Time in UTC epoch ms (`long`)** end-to-end.
8. **Errors are RFC 7807 ProblemDetail** — caught by `httpClient` and rethrown as `HttpError`.
9. **Paging**: time-series uses cursor (`{items, nextCursor, hasMore}`); meta/list uses offset (`{items, page, size, total}`).
10. **ErrorBoundary** is required around any page that depends on a live external API.
