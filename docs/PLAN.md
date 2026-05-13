# plan.md — coin_front 화면 구현 계획

> 작성일: 2026-05-12 | 상태: 계획 수립, 구현 단계 진입 전
> 본 문서는 coin_front 프로젝트의 **화면(UI) 영역** 만을 다룹니다. 서버 연결 부분은 사용자가 직접 진행하므로, 이 계획에서는 데이터 인터페이스를 **mock 우선**으로 정의하고 실제 호출 전환이 쉬운 구조만 마련합니다.

---

## 0. 작업 원칙

| 항목 | 결정 |
|---|---|
| 역할 분담 | 화면 구현 = 에이전트, 서버 연결(API 클라이언트 실호출) = 사용자 |
| 데이터 소스 | 1단계: 전체 mock fixture. 2단계: 사용자가 mock → real 전환. **mock과 real의 인터페이스 동일**. |
| 컨벤션 일관성 | coin_back의 응답 envelope (`CursorPage`, `OffsetPage`), 시간 단위 (epoch ms), 에러 포맷 (RFC 7807 ProblemDetail), 토픽/SSE 이벤트명 그대로 사용 |
| 신뢰성 | "화면 깨짐 0건"이 최우선 목표. 차트, 외부 데이터, 인증 어느 한 곳이 실패해도 다른 영역이 멀쩡해야 함. |
| 디자인 | 트레이딩 도구는 다크 테마가 표준. 라이트 모드 토글 제공. |
| 시크릿 | `.env.local`, 절대 코드/저장소에 직접 노출 금지 (백엔드의 application.yml 규칙과 동일 원칙) |

---

## 1. 기술 스택과 선택 이유

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router) + React 19** | SSR/CSR 혼용, 라우팅 표준, OpenAPI 문서 페이지에 SSG 활용 가능 |
| 언어 | **TypeScript (strict)** | 백엔드 record를 타입으로 그대로 미러링. 컴파일러로 응답 스키마 일치 보증 |
| 스타일 | **TailwindCSS + shadcn/ui** | 깨짐 없는 일관 디자인, 다크 모드 native 지원, 컴포넌트 복사 기반이라 잠금(lock-in) 없음 |
| 차트 (캔들) | **lightweight-charts v4** (TradingView 제작) | **현재 캔들 차트가 이상한 원인은 recharts/chart.js로 OHLC를 그렸기 때문.** lightweight-charts는 캔들/볼륨/지표 오버레이가 표준 거래소 차트와 동일. 무료, 의존성 가볍고 (45kb gzip), 시계열 줌/드래그 native. |
| 차트 (일반) | **Recharts** | 라인/바/캘린더처럼 단순한 시각화는 충분. 캔들에만 lightweight-charts 사용. |
| 데이터 페칭 | **TanStack Query v5** | 캐시, 재시도, stale-while-revalidate. 백엔드 cursor 페이징을 `useInfiniteQuery` 한 줄로 처리. |
| 실시간 | **EventSource (native)** + 추후 **EventSource Polyfill** | 백엔드가 SSE이므로 WebSocket 도입 불필요. EventSource로 충분. |
| 상태관리 | **Zustand** | 사용자/테마/사이드바 같은 가벼운 전역 상태만. 서버 상태는 TanStack Query가 담당. |
| 폼 | **react-hook-form + zod** | API Key 발급 폼, 알람 규칙 폼, 로그인 등. zod로 백엔드 검증 규칙 미러링. |
| 아이콘 | **lucide-react** | shadcn 표준 |
| 코드 하이라이트 | **Shiki** | API 문서 페이지의 JSON/curl 예시. SSR friendly. |
| 테스트 | **Vitest + Testing Library + Playwright** | 단위 + e2e |

### 캔들 차트 교체 이유 (사용자 지적 사항 해결)

기존 캔들 차트의 "이상한 형태"는 보통 다음 중 하나입니다.

1. recharts/chart.js로 OHLC를 그릴 때 wick(꼬리)이 body 두께와 분리되지 않음
2. 시간축이 카테고리(category)로 잡혀 있어 갭(gap) 표현이 안 됨
3. 자동 스케일이 anomaly 값에 끌려가 본체가 평평하게 보임
4. 양봉/음봉 색이 거래소 표준(상승=초록/적색)을 안 따름

→ **lightweight-charts** 로 가면 위 모두가 라이브러리 기본 동작으로 해결됩니다. 같은 회사가 TradingView 만든 곳이라 사용자가 익숙한 형태입니다.

---

## 2. 디렉토리 구조

```
coin_front/
├── plan.md                                  ← 본 문서
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json                            ← strict: true
├── .env.example                             ← 환경변수 placeholder
├── .env.local                               ← (gitignore) 실제 값
├── public/
│   └── favicon, og 이미지 등
└── src/
    ├── app/                                 ← Next.js App Router
    │   ├── layout.tsx                       ← 루트 레이아웃 (Provider, Theme, GlobalIndicatorBar)
    │   ├── page.tsx                         ← / 대시보드
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   ├── market/
    │   │   ├── page.tsx                     ← 마켓 리스트 (검색/필터/페이지네이션)
    │   │   └── [symbol]/page.tsx            ← 마켓 상세 (캔들+김프+지표)
    │   ├── watchlist/page.tsx
    │   ├── alerts/
    │   │   ├── page.tsx                     ← 알람 규칙 목록 + 발화 이력
    │   │   ├── new/page.tsx                 ← 알람 규칙 생성
    │   │   └── [id]/page.tsx                ← 알람 규칙 상세/편집
    │   ├── economic/
    │   │   ├── page.tsx                     ← 경제지표 캘린더/타임라인
    │   │   └── [code]/page.tsx              ← 지표 상세
    │   ├── api-keys/page.tsx                ← 바이낸스 스타일
    │   ├── api-docs/
    │   │   ├── page.tsx                     ← 업비트 개발자 센터 스타일
    │   │   └── [...slug]/page.tsx
    │   ├── settings/page.tsx
    │   └── error.tsx                        ← 글로벌 에러 바운더리
    │
    ├── components/
    │   ├── layout/
    │   │   ├── GlobalIndicatorBar.tsx       ← 상단 6개 지표 (환율/김프평균/나스닥/금은/10Y/공탐)
    │   │   ├── Sidebar.tsx                  ← 좌측 메뉴
    │   │   ├── Header.tsx                   ← 상단 (로고/검색/유저)
    │   │   └── AppShell.tsx
    │   ├── chart/
    │   │   ├── CandleChart.tsx              ← lightweight-charts wrapper
    │   │   ├── PremiumLineChart.tsx
    │   │   ├── IndicatorOverlay.tsx         ← EMA/RSI 등 캔들 위 오버레이
    │   │   ├── MiniSparkline.tsx
    │   │   └── ChartErrorBoundary.tsx
    │   ├── dashboard/
    │   │   ├── WatchlistPanel.tsx
    │   │   ├── AlertPanel.tsx               ← 최근 발화 + 활성 규칙 요약
    │   │   ├── PremiumRankingPanel.tsx
    │   │   └── EconomicTimelinePanel.tsx
    │   ├── market/
    │   │   ├── MarketTable.tsx
    │   │   ├── MarketSearchBar.tsx
    │   │   ├── MarketFilterDrawer.tsx
    │   │   └── MarketDetailHeader.tsx
    │   ├── alert/
    │   │   ├── AlertRuleForm.tsx
    │   │   ├── AlertRuleCard.tsx
    │   │   └── AlertHistoryList.tsx
    │   ├── apikey/
    │   │   ├── ApiKeyTable.tsx
    │   │   ├── ApiKeyCreateDialog.tsx       ← 발급 직후 한 번만 보이는 secret + 복사
    │   │   ├── ApiKeyScopePicker.tsx
    │   │   └── ApiKeyUsageChart.tsx
    │   ├── apidocs/
    │   │   ├── ApiDocsLayout.tsx            ← 업비트 스타일 좌측 트리 + 우측 본문
    │   │   ├── EndpointDetail.tsx
    │   │   └── CodeSample.tsx               ← Shiki highlighted curl/js
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   └── SignupForm.tsx
    │   ├── common/
    │   │   ├── DataTable.tsx                ← 정렬, 페이징 generic
    │   │   ├── CursorPagination.tsx         ← {nextCursor, hasMore} 처리
    │   │   ├── OffsetPagination.tsx         ← {page, size, total} 처리
    │   │   ├── SkeletonLoader.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── ProblemDetailAlert.tsx       ← RFC 7807 응답 표시
    │   │   ├── CopyButton.tsx
    │   │   └── ThemeToggle.tsx
    │   └── ui/                              ← shadcn 컴포넌트
    │       ├── button.tsx
    │       ├── dialog.tsx
    │       ├── input.tsx
    │       └── ...
    │
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts                    ← fetch wrapper, baseURL, 인증 헤더, 에러 정규화
    │   │   ├── endpoints.ts                 ← 백엔드 경로 상수 (변경 1곳)
    │   │   ├── types.ts                     ← 백엔드 record 미러
    │   │   ├── meta.ts                      ← /api/v1/meta/*
    │   │   ├── market.ts                    ← /api/v1/market/*
    │   │   ├── analytics.ts                 ← /api/v1/analytics/*
    │   │   ├── economic.ts                  ← /api/v1/economic/*
    │   │   ├── composition.ts               ← /api/v1/compose/*
    │   │   ├── alert.ts                     ← (백엔드 미구현, 인터페이스만)
    │   │   ├── watchlist.ts                 ← (백엔드 미구현, 인터페이스만)
    │   │   ├── auth.ts                      ← (백엔드 미구현, 인터페이스만)
    │   │   ├── apikey.ts                    ← (백엔드 미구현, 인터페이스만)
    │   │   └── stream.ts                    ← SSE 구독 (EventSource)
    │   ├── external/                        ← 백엔드 거치지 않고 프론트가 직접 호출
    │   │   ├── fearGreed.ts                 ← alternative.me /fng/
    │   │   ├── metals.ts                    ← 금/은
    │   │   ├── indices.ts                   ← 나스닥
    │   │   └── treasury.ts                  ← 미 10년물
    │   ├── mock/                            ← 백엔드 미연결 시 fixture
    │   │   ├── market.ts
    │   │   ├── analytics.ts
    │   │   ├── economic.ts
    │   │   ├── alert.ts
    │   │   ├── apikey.ts
    │   │   ├── external.ts
    │   │   └── index.ts                     ← USE_MOCK 환경변수로 분기
    │   ├── hooks/
    │   │   ├── useGlobalIndicators.ts       ← 상단 6개 지표 통합
    │   │   ├── useMarketList.ts
    │   │   ├── useCandleSeries.ts
    │   │   ├── useIndicatorSeries.ts
    │   │   ├── usePremiumRanking.ts
    │   │   ├── useEconomicCalendar.ts
    │   │   ├── useWatchlist.ts
    │   │   ├── useAlertRules.ts
    │   │   ├── useSSE.ts                    ← EventSource generic hook
    │   │   ├── useTickStream.ts
    │   │   └── usePremiumStream.ts
    │   ├── store/
    │   │   ├── auth.ts                      ← 로그인 사용자/토큰
    │   │   ├── theme.ts                     ← dark/light
    │   │   ├── watchlist.ts                 ← 로컬 즐겨찾기 (로그인 전엔 localStorage)
    │   │   └── ui.ts                        ← 사이드바 열림 등
    │   ├── utils/
    │   │   ├── format.ts                    ← 숫자/시간/통화 포맷
    │   │   ├── premium.ts                   ← 트림 평균 (사용자 정의 김프)
    │   │   ├── interval.ts                  ← 백엔드 Interval enum 미러
    │   │   ├── cn.ts                        ← clsx + tailwind-merge
    │   │   └── time.ts                      ← epoch ms ↔ Date 변환
    │   ├── schema/                          ← zod 폼 스키마
    │   │   ├── alertRule.ts
    │   │   ├── apiKey.ts
    │   │   └── auth.ts
    │   └── constants.ts                     ← Interval, IndicatorType 상수 (백엔드 enum 미러)
    │
    └── styles/
        └── globals.css                       ← Tailwind base + 커스텀 토큰
```

---

## 3. 페이지 구성 한눈에

| 경로 | 화면 | 백엔드 의존 | 외부 의존 |
|---|---|---|---|
| `/` | 대시보드 (Watchlist / Alert / Premium / Economic) | market, analytics, economic, (alert, watchlist) | 상단 바: 금은/나스닥/10Y/공탐 |
| `/market` | 마켓 리스트 (검색·필터·offset 페이징) | meta_data_query, market_data_query | — |
| `/market/[symbol]` | 마켓 상세 (캔들+김프+지표+SSE) | analytics_query, market_data_query, SSE | — |
| `/watchlist` | 즐겨찾기 관리 (로그인 전 localStorage) | (watchlist, 미구현) | — |
| `/alerts` | 알람 규칙 목록 + 발화 이력 | (alert, 미구현) | — |
| `/alerts/new` | 알람 규칙 생성 폼 | (alert, 미구현) | — |
| `/alerts/[id]` | 알람 규칙 상세/편집 | (alert, 미구현) | — |
| `/economic` | 경제지표 캘린더/타임라인 | economic_query | — |
| `/economic/[code]` | 지표 상세 (시계열 + 변화율) | economic_query | — |
| `/api-keys` | API 키 관리 (바이낸스 스타일) | (apikey, 미구현) | — |
| `/api-docs` | API 문서 (업비트 스타일) | `/v3/api-docs` (springdoc) | — |
| `/login`, `/signup` | 인증 | (auth, 미구현) | — |
| `/settings` | 테마/언어/알림 채널 설정 | (user, 미구현) | — |

---

## 4. 상단 글로벌 인디케이터 바 상세

좌→우 6개 위젯. 모든 위젯은 **고정 width**로 슬롯에 들어가고, 로딩 중일 때도 같은 자리에 skeleton 표시 → CLS(Cumulative Layout Shift) 0 보장.

| # | 위젯 | 데이터 출처 | 갱신 |
|---|---|---|---|
| 1 | USD/KRW 환율 | 백엔드 `/api/v1/market/fx/latest` | 1초 (혹은 SSE 추가 시 push) |
| 2 | 코인 평균 김프 (BTC/ETH/XRP/SOL 중 max/min 제외 평균) | 백엔드 `/api/v1/market/premium/snapshot/{base}` × 4 → 프론트에서 계산 | 1초 |
| 3 | 나스닥 종합 | 프론트 직접 (yfinance/finnhub/mock) | 분 단위 |
| 4 | 금 / 은 (두 줄 한 위젯) | 프론트 직접 (goldapi/metals-api/mock) | 분 단위 |
| 5 | 미국 10년물 금리 | 프론트 직접 (FRED/mock) — 백엔드 economic에 이미 FRED 있으나 별도 호출로 책임 분리 | 시간 단위 |
| 6 | 공포·탐욕 지수 | 프론트 직접 (alternative.me `/fng/`) | 일 단위 |

### 평균 김프 계산 (`lib/utils/premium.ts`)

```ts
/**
 * 4개 김프 중 최고/최저 1개씩 제외한 트림 평균.
 * 입력 < 3: 단순 평균. 입력 3~4: 트림 평균. 입력 > 4: 최상위/최하위 1개씩 제외.
 */
export function trimmedAveragePremium(prems: number[]): number | null {
  const valid = prems.filter((p) => Number.isFinite(p));
  if (valid.length === 0) return null;
  if (valid.length < 3) return valid.reduce((a, b) => a + b, 0) / valid.length;
  const sorted = [...valid].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}
```

대상 심볼: `["BTC", "ETH", "XRP", "SOL"]` — 사용자 지정. 향후 설정에서 변경 가능하게 store에 보관.

### 외부 데이터 처리 원칙

| 항목 | 규칙 |
|---|---|
| 실패 시 | 위젯 자리에 `—` 표시 + tooltip에 "데이터 가져오기 실패". **다른 위젯과 페이지 전체는 영향 없음** |
| Rate limit | 클라이언트에서 stale-time을 길게 (금은 5분, 공탐 60분 등). 응답을 localStorage에 캐싱해서 재방문 시 즉시 표시 |
| Mock 우선 | 환경변수 `NEXT_PUBLIC_USE_MOCK_EXTERNAL=true`면 mock 반환. 포트폴리오 시연 시 외부 API 키 노출 위험 회피 |
| 비용 | 무료 티어 한도 내. 키가 필요한 경우 `.env.local`에 보관, 코드에 직접 박지 않음 |

### 추천 외부 API (모두 무료 티어 존재)

- 공포·탐욕 지수: `https://api.alternative.me/fng/?limit=1` (키 불필요)
- 나스닥: `finnhub.io` free tier (60 req/min) — symbol `^IXIC`
- 금/은: `metals-dev.com` free / `goldapi.io` (월 100건 무료)
- 10년물: 백엔드의 FRED 호출 결과 재활용 가능. 또는 finnhub의 `US10Y`

→ **선택**: 1차에선 mock 데이터로 전부 채우고, 사용자가 키 확보 후 실호출로 교체.

---

## 5. 메인 대시보드 (`/`) 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  [환율]  [평균김프]  [나스닥]  [금/은]  [10Y]  [공탐]    🌓 👤 │   ← GlobalIndicatorBar (고정)
├──────┬──────────────────────────────────────────────────────┤
│      │  ┌──────────────────────┬──────────────────────┐    │
│ Side │  │  📌 Watchlist        │  🔔 Alert            │    │
│ bar  │  │  마켓 4~8개 + 김프    │  최근 발화 5건         │    │
│      │  │  + mini sparkline    │  + 활성 규칙 수        │    │
│      │  ├──────────────────────┼──────────────────────┤    │
│      │  │  🔥 Premium 랭킹       │  📅 Economic 타임라인  │    │
│      │  │  Top 10 김프         │  최근/예정 이벤트       │    │
│      │  │  + 변화 화살표        │  + 영향도 색상         │    │
│      │  └──────────────────────┴──────────────────────┘    │
└──────┴──────────────────────────────────────────────────────┘
```

### 4분할 패널 상세

#### Watchlist 패널
- 사용자가 즐겨찾기한 마켓 코드 표시 (기본은 BTC/ETH/XRP/SOL 4개 seed)
- 각 행: 거래소 로고 / 심볼 / 현재가 / 24h 변화율 / 김프 / 30분 sparkline
- SSE `/api/v1/stream/ticks?marketCodeId={id}` 구독으로 가격 라이브 갱신
- 클릭 → `/market/[symbol]` 이동
- 로그인 전: `localStorage` 저장. 로그인 후: 백엔드 동기화 (백엔드 watchlist 모듈 추가 시)

#### Alert 패널
- 최근 발화 이력 5건 (시간/규칙명/조건/현재값)
- 활성 규칙 카운트 배지
- "규칙 추가" 버튼 → `/alerts/new`
- 백엔드 미구현 단계에선 mock 데이터로 풀 시연 가능

#### Premium 랭킹 패널
- 백엔드 `/api/v1/market/premium/ranking?n=10`
- 김프 절댓값 기준 상위 10개
- 화살표(↑↓)로 1분 전 대비 변화 표시 (이전 fetch와 diff)
- 표 헤더 정렬 가능 (심볼, 김프, 변화)

#### Economic 타임라인 패널
- 백엔드 `/api/v1/economic/calendar?fromTs=&toTs=`
- 오늘 ± 3일 범위, 영향도(high/medium/low) 색상
- 발표 완료 이벤트는 실제값/예상값 표시
- 클릭 → `/economic/[code]` 이동

---

## 6. 캔들 차트 구현 (`components/chart/CandleChart.tsx`)

### 사용자 지적 사항: "캔들 차트가 형태가 이상하다"

→ **lightweight-charts v4** 로 교체. 핵심 요구사항:

1. **양봉/음봉 색상**: 한국 표준 (상승=빨강, 하락=파랑) vs 글로벌 표준 (상승=초록, 하락=빨강) 토글
2. **시간축 갭 없음**: 데이터 없는 시간대를 압축해서 보여줌 (lightweight-charts 기본 동작)
3. **자동 스케일링 + 마우스 휠 줌 + 드래그 팬**: 기본 활성
4. **거래량 보조 차트**: 캔들 하단 25% 영역에 거래량 바 (옵션)
5. **지표 오버레이**: EMA/RSI/STDDEV를 같은 차트 또는 별도 paneㄷ
6. **크로스헤어 + OHLCV 툴팁**: 마우스 위치의 시간/OHLC/거래량
7. **반응형 리사이즈**: `ResizeObserver`로 부모 크기 변경 시 차트 재배치
8. **interval 전환**: 1m / 5m / 15m / 1h / 4h / 1d 토글 (백엔드 `Interval` enum 미러)
9. **무한 스크롤**: 차트 좌측 끝 도달 시 `useInfiniteQuery`로 과거 데이터 prepend

### 데이터 입력 형식 (백엔드 응답과 매핑)

```ts
// 백엔드 응답 (CursorPage<TickCandleView>)
type TickCandleView = {
  marketCodeId: number;
  interval: string;            // "1m", "5m", ...
  bucketOpenTs: number;        // epoch ms
  open: string;                // BigDecimal as string
  high: string;
  low: string;
  close: string;
  volume?: string;
};

// lightweight-charts 입력
type CandlestickData = {
  time: number;                // 초 단위 (epoch s)
  open: number;
  high: number;
  low: number;
  close: number;
};

// 변환: bucketOpenTs / 1000, string → Number
```

### 핵심 구현 노트

- BigDecimal 문자열 → `Number`는 정밀도 손실 가능. 차트 표시용이라 허용. 정확한 비교/계산은 원본 문자열로.
- `time` 필드는 lightweight-charts가 **초 단위 epoch**를 기대. 백엔드는 **밀리초**. 변환 잊지 말 것.
- SSE로 들어오는 close 이벤트는 `series.update({...})` 호출 (마지막 캔들 갱신 또는 새 캔들 추가).
- 차트 컴포넌트는 `ChartErrorBoundary`로 감싸서 차트 실패가 페이지 전체를 깨트리지 않게.

---

## 7. API 키 관리 (`/api-keys`) — 바이낸스 스타일

### 화면 구성

```
┌────────────────────────────────────────────────────────┐
│  API 키 관리                              [+ 키 생성]   │
│  현재 활성 키 3 / 최대 10                                │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📌 trading-bot-prod              [활성]          │  │
│  │ 생성: 2026-03-12 / 최근 사용: 5분 전              │  │
│  │ 권한: [market:read] [stream:subscribe]            │  │
│  │ IP 제한: 203.0.113.42                            │  │
│  │ 일일 요청: 12,403 / 50,000                        │  │
│  │       [편집]  [IP 변경]  [비활성화]  [삭제]        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📌 personal-dashboard            [비활성]         │  │
│  │ ...                                              │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 키 생성 다이얼로그 (바이낸스 핵심 UX 차용)

1. **1단계**: 키 라벨 입력 + 권한 스코프 선택 (체크박스)
2. **2단계**: 2FA 또는 이메일 인증 코드 입력 (mock 단계에선 스킵)
3. **3단계**: 생성 완료 화면 — **API Key와 Secret Key가 처음이자 마지막으로 표시**
    - 큰 빨간색 경고: "Secret Key는 이 화면을 닫으면 다시 볼 수 없습니다."
    - 각 키 옆에 복사 버튼
    - "복사 완료" 체크박스를 켜야 닫기 버튼 활성
4. 닫은 후 목록으로 이동, 새 키 카드가 상단에 강조 표시 (3초 하이라이트)

### 권한 스코프 (백엔드 합의 필요, 1차안)

| 스코프 | 설명 |
|---|---|
| `market:read` | 마켓/틱/김프/FX 조회 |
| `analytics:read` | 캔들/지표 조회 |
| `economic:read` | 경제지표 조회 |
| `stream:subscribe` | SSE 구독 |
| `watchlist:write` | 워치리스트 변경 (해당 사용자) |
| `alert:write` | 알람 규칙 변경 (해당 사용자) |

→ 이건 백엔드와 합의 전 임시. 화면은 스코프 목록을 prop으로 받게 해서 백엔드 변경 시 한 곳만 수정.

### 사용량 통계

- 일별 요청 수 (최근 30일) — Recharts BarChart
- 시간대별 분포 (최근 24시간) — 히트맵 옵션
- mock 단계: 적절한 패턴의 fixture (피크 시간대 표현)

---

## 8. API 문서 (`/api-docs`) — 업비트 개발자 센터 스타일

### 구조

```
┌────────────────────────────────────────────────────────┐
│  검색: [                                         ] 🔍   │
├────────────┬───────────────────────────────────────────┤
│ Sidebar    │ Endpoint Detail                           │
│ (좌측 트리)  │                                          │
│            │ GET /api/v1/market/ticks/latest/{id}       │
│ ▼ Market   │ ─────────────────────────────────────     │
│   • Tick   │ 최신 틱 단건 조회                          │
│   • Premium│                                          │
│   • FX     │ ▸ Path Parameters                         │
│            │   marketCodeId  (number, required)        │
│ ▼ Analytics│                                          │
│   • Candle │ ▸ Response 200                            │
│   • Indi.. │   { marketCodeId, bid, ask, ts }          │
│            │                                          │
│ ▼ Economic │ ▸ Response 404                            │
│            │   RFC 7807 ProblemDetail                  │
│ ▼ Meta     │                                          │
│            │ ▸ 예시                                    │
│ ▼ Compose  │ ┌────────────────────────────────────┐   │
│            │ │ curl -X GET .../market/ticks/...   │   │
│ ▼ Stream   │ └────────────────────────────────────┘   │
└────────────┴───────────────────────────────────────────┘
```

### 데이터 소스

- 백엔드 springdoc-openapi가 `/v3/api-docs`에 JSON 제공
- 빌드 시 한 번 fetch → 정적 데이터로 페이지 생성 (Next.js `generateStaticParams`)
- 개발 모드: 런타임 fetch
- mock 단계: 사전에 저장된 `openapi.json` 파일 사용

### 코드 예시

각 엔드포인트 상세에 4가지 탭:
- `curl`
- `JavaScript (fetch)`
- `Python (httpx)`
- `Java (Spring WebClient)`

→ Shiki로 SSR 하이라이트, 복사 버튼 부착.

### "Try it out" 기능

업비트 문서에는 없지만 Swagger UI에는 있음. 1차에선 **생략**. 보안/CORS 처리가 복잡함. 대신 페이지 상단에 "Swagger UI는 dev 프로파일에서 `/swagger-ui.html` 접근 가능" 안내.

---

## 9. 알람(Alert) / 워치리스트 / 인증

이 영역은 **백엔드 미구현 상태**. 화면은 mock으로 풀 동작 시연 가능하게 작성하고, 인터페이스만 깨끗하게 정의해서 사용자가 백엔드 추가 시 어댑터 교체로 끝나게 함.

### Alert 규칙 데이터 모델 (1차안)

```ts
type AlertRule = {
  id: number;
  userId: number;
  label: string;                  // "BTC 김프 폭발"
  targetType: "PREMIUM" | "TICK" | "INDICATOR";
  targetMarketCodeId?: number;
  targetPremiumKey?: string;      // "BTC:1:2"
  targetIndicator?: {
    type: "RSI" | "EMA" | "STDDEV";
    period: number;
    interval: string;
  };
  condition: {
    operator: ">" | ">=" | "<" | "<=" | "==";
    threshold: string;            // BigDecimal as string
  };
  cooldownSec: number;            // 같은 규칙 재발화 최소 간격
  notificationChannels: ("SSE" | "EMAIL" | "DISCORD")[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type AlertFiring = {
  id: number;
  ruleId: number;
  firedAt: number;
  observedValue: string;
  context: Record<string, unknown>;
};
```

### Alert 규칙 폼

zod 스키마로 검증:
- 라벨 1~50자
- threshold는 numeric string + 부호 가능
- cooldown 10초 이상
- 채널 최소 1개 선택

폼 컴포넌트는 `AlertRuleForm.tsx`. 동적 필드: targetType 선택에 따라 하위 입력 필드 전환.

### 인증 (login/signup)

- JWT 기반 가정. accessToken은 메모리(`Zustand`), refreshToken은 httpOnly 쿠키 (백엔드와 합의 필요)
- 401 응답 → silent refresh 시도 → 실패 시 로그인 페이지로
- mock 단계: localStorage에 임시 토큰 저장, 모든 사용자/API 통과

### 워치리스트

- 로그인 전: `localStorage[ys:watchlist]` 에 marketCodeId 배열
- 로그인 후: 백엔드 동기화. 로그인 시점에 localStorage → 서버 머지

---

## 10. 화면 깨짐 방지 (사용자 지적 사항 해결)

기존에 화면이 깨지는 이유는 보통 아래 중 하나입니다. 본 프로젝트는 모두 사전 차단.

| 깨짐 원인 | 대응 |
|---|---|
| 데이터 로딩 중 레이아웃 점프 (CLS) | 모든 동적 영역은 **고정 크기 컨테이너** + **skeleton**. 텍스트 크기까지 동일 line-height. |
| 차트 라이브러리가 부모 크기 0일 때 폭주 | `ResizeObserver` + 최소 width/height 지정. 부모가 0이면 차트 자체 비표시 + EmptyState. |
| 외부 API 실패가 페이지 전체 죽임 | 모든 외부 호출은 `ErrorBoundary`로 격리. 위젯 단위 실패 → 해당 위젯만 `—`. |
| 긴 텍스트가 컨테이너 깸 | `truncate` + `min-w-0` 패턴 일관 적용. 표 셀은 `whitespace-nowrap` + `overflow-hidden`. |
| 모바일에서 사이드바가 본문 침범 | breakpoint `md` 미만에선 사이드바 drawer로 전환. body scroll lock. |
| 다크/라이트 전환 시 일순 깜빡임 (flash) | `next-themes`로 hydration 전 테마 적용. 서버 렌더에 `suppressHydrationWarning`. |
| SSE 연결 누수로 메모리 폭증 | `useSSE` 훅이 `useEffect` cleanup에서 `EventSource.close()` 보장. unmount 시 무조건 해제. |
| 페이지 이동 시 데이터 깜빡임 | TanStack Query `placeholderData: keepPreviousData`. |
| 폼 입력 도중 리렌더로 포커스 풀림 | react-hook-form의 uncontrolled 패턴 사용. |
| BigDecimal `Number` 변환 오버플로 | 비교/계산은 문자열 또는 `decimal.js`. 차트 표시만 `Number`. |

### 글로벌 에러 핸들링

- `app/error.tsx` — 페이지 단위 에러
- `app/global-error.tsx` — 루트 레이아웃 에러
- `ChartErrorBoundary` — 차트 전용
- `ProblemDetailAlert` — 백엔드 4xx/5xx 표시 (RFC 7807 필드 그대로)

### 접근성 / 반응형

- 키보드만으로 모든 주요 동작 가능 (Tab 순서, Esc로 다이얼로그 닫기)
- 색상 외 정보 전달 (상승/하락에 화살표 아이콘 동반)
- 모바일(< 768px), 태블릿(< 1024px), 데스크탑(< 1440px), 와이드(>=1440px) 4단계
- 사이드바: 데스크탑 고정, 태블릿 토글, 모바일 drawer

---

## 11. 백엔드 연결 인터페이스 (mock 우선)

### API 클라이언트 (`lib/api/client.ts`)

```ts
// 핵심 의도
// 1. baseURL은 환경변수 NEXT_PUBLIC_API_BASE_URL
// 2. 인증 헤더는 Zustand store에서 읽음
// 3. 응답이 ProblemDetail이면 ApiError로 정규화
// 4. cursor/offset 페이지 envelope을 자동 분기 처리
// 5. USE_MOCK=true면 mock 모듈로 우회
```

### mock 전환 스위치

```ts
// lib/api/market.ts
export const marketApi = process.env.NEXT_PUBLIC_USE_MOCK === "true"
  ? mockMarketApi
  : realMarketApi;
```

→ 사용자가 백엔드 실호출 전환 시 환경변수만 바꾸면 됨.

### 백엔드 record를 TypeScript 타입으로 미러 (`lib/api/types.ts`)

CoinData의 record를 그대로 미러링. 시간 필드는 모두 `number` (epoch ms). BigDecimal은 모두 `string`. 백엔드와 1:1.

```ts
export type TickLatestView = {
  marketCodeId: number;
  bid: string;
  ask: string;
  ts: number;
};

export type PremiumSnapshot = {
  baseExchangeId: number;
  compareExchangeId: number;
  symbol: string;
  premium: string;       // 김프 (예: "0.0421" = 4.21%)
  ts: number;
};

export type TickCandleView = {
  marketCodeId: number;
  interval: string;
  bucketOpenTs: number;
  open: string;
  high: string;
  low: string;
  close: string;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
};

export type OffsetPage<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

export type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
};
```

### 엔드포인트 상수 (`lib/api/endpoints.ts`)

```ts
export const API = {
  meta: {
    exchanges: "/api/v1/meta/exchanges",
    marketsByExchange: (id: number) => `/api/v1/meta/exchanges/${id}/markets`,
    marketSearch: "/api/v1/meta/markets/search",
  },
  market: {
    tickLatest: (id: number) => `/api/v1/market/ticks/latest/${id}`,
    tickLatestBulk: "/api/v1/market/ticks/latest",
    premiumSnapshot: (base: string) => `/api/v1/market/premium/snapshot/${base}`,
    premiumRanking: "/api/v1/market/premium/ranking",
    premiumSeries: "/api/v1/market/premium/series",
    fxLatest: "/api/v1/market/fx/latest",
  },
  analytics: {
    candles: "/api/v1/analytics/candles",
    candlesMini: "/api/v1/analytics/candles/mini",
    candlesDownsampled: "/api/v1/analytics/candles/downsampled",
    indicators: "/api/v1/analytics/indicators",
    indicatorsLatest: "/api/v1/analytics/indicators/latest",
    indicatorsLatestMulti: "/api/v1/analytics/indicators/latest/multi",
    screener: "/api/v1/analytics/screener",
  },
  economic: {
    series: (codeId: number) => `/api/v1/economic/indicators/${codeId}/series`,
    calendar: "/api/v1/economic/calendar",
    indicatorMeta: (codeId: number) => `/api/v1/economic/indicators/${codeId}`,
    indicators: "/api/v1/economic/indicators",
    changeRate: (codeId: number) => `/api/v1/economic/indicators/${codeId}/change-rate`,
    correlation: "/api/v1/economic/correlation",
  },
  compose: {
    marketOverview: (id: number) => `/api/v1/compose/market-overview/${id}`,
    chart: (id: number) => `/api/v1/compose/chart/${id}`,
    dashboard: "/api/v1/compose/dashboard",
  },
  stream: {
    ticks: "/api/v1/stream/ticks",
    premium: "/api/v1/stream/premium",
    candlesClose: "/api/v1/stream/candles/close",
    indicatorsClose: "/api/v1/stream/indicators/close",
  },
  // 백엔드 미구현 (인터페이스만)
  alert: {
    rules: "/api/v1/alert/rules",
    rule: (id: number) => `/api/v1/alert/rules/${id}`,
    firings: "/api/v1/alert/firings",
  },
  watchlist: {
    list: "/api/v1/watchlist",
    item: (id: number) => `/api/v1/watchlist/${id}`,
  },
  auth: {
    login: "/api/v1/auth/login",
    signup: "/api/v1/auth/signup",
    refresh: "/api/v1/auth/refresh",
    me: "/api/v1/auth/me",
  },
  apikey: {
    list: "/api/v1/api-keys",
    create: "/api/v1/api-keys",
    item: (id: number) => `/api/v1/api-keys/${id}`,
    usage: (id: number) => `/api/v1/api-keys/${id}/usage`,
  },
} as const;
```

### SSE 클라이언트 (`lib/api/stream.ts`, `lib/hooks/useSSE.ts`)

```ts
// useSSE<T>({ path, params, onMessage })
// - EventSource 생성, cleanup 보장
// - reconnect 백오프
// - connected 이벤트는 무시, 실제 데이터 이벤트만 전달
// - 페이지 visibility 비활성 시 일시 정지 (모바일 배터리)
```

SSE 이벤트명(`tick`, `premium`, `tick-candle`, `premium-candle`, `tick-indicator`, `premium-indicator`)은 백엔드 컨벤션 그대로.

---

## 12. 환경변수 (`.env.example`)

```bash
# 백엔드 base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Mock 모드
NEXT_PUBLIC_USE_MOCK=true                  # 전체 mock
NEXT_PUBLIC_USE_MOCK_EXTERNAL=true         # 외부 API만 mock (백엔드는 실호출)

# 외부 API 키 (실호출 시)
NEXT_PUBLIC_FINNHUB_API_KEY=
NEXT_PUBLIC_GOLDAPI_KEY=
# 공탐 지수는 키 불필요

# 기타
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_APP_NAME=CoinData
```

→ `NEXT_PUBLIC_` 접두사는 클라이언트 노출. 백엔드처럼 시크릿이 들어가면 안 됨. 외부 API 키는 본래 백엔드 경유가 안전하지만, 포트폴리오 용도라 1차에선 클라이언트 호출 허용.

---

## 13. 작업 순서 (마일스톤)

### M1 — 스켈레톤 (1~2일) ✅ 완료
- [x] Vite + TypeScript + Custom CSS (Next.js 대신 Vite로 진행, 기존 코드 유지)
- [x] 폴더 구조 생성 (features / pages / shared / app)
- [x] 루트 레이아웃 + AppLayout + Sidebar + Header (AppLayout.tsx)
- [x] 라우팅 페이지 빈 껍데기 전체 생성 — react-router-dom BrowserRouter + 13개 라우트
- [x] 다크/라이트 테마 토글 — Zustand themeStore + ThemeToggle 컴포넌트 + CSS tokens
- [x] `shared/api/endpoints.ts`, `types.ts`, `httpClient.ts` 작성
- [x] mock 인프라 (premiumApi, economicApi, marketApi) + `VITE_USE_MOCK` 환경변수
- [x] TanStack Query Provider 실구현
- [x] `.env.example`, `.env.local`, `vite.config.ts` 생성

**검증**: `npm run dev` 후 모든 페이지 클릭 가능, 깨짐 없음. tsc --noEmit 통과.

### M2 — 상단 글로벌 인디케이터 바 (1일) ✅ 완료
- [x] `GlobalIndicatorBar` 컴포넌트 + 6개 위젯 (USD/KRW, 평균김프, 나스닥, 금/은, 10Y, 공탐)
- [x] 환율/김프평균 mock 호출 (externalMock.ts)
- [x] 나스닥/금은/10Y/공탐 mock fixture
- [x] 트림 평균 김프 유틸 (`shared/lib/premiumUtils.ts`)
- [x] 위젯별 try/catch로 `—` 격리 표시 (ErrorBoundary 역할)
- [x] AppLayout에 GlobalIndicatorBar 통합
- [x] 반응형 CSS (1024px 이하 2행, 600px 이하 가로 스크롤)

**검증**: 6개 위젯 모두 표시, 한 위젯 강제 실패 시 다른 5개 정상.

### M3 — 메인 대시보드 4분할 (2~3일) ✅ 완료
- [x] Watchlist 패널 (BTC/ETH/XRP/SOL seed 4개, 클릭 시 `/market/:symbol`)
- [x] Premium 랭킹 패널 (PremiumTable + PremiumFilterBar)
- [x] Economic 타임라인 패널 (EconomicTimeline)
- [x] Alert 패널 (mock — 최근 발화 5건, 활성 규칙 카운트 배지)
- [x] SkeletonLoader, ErrorState 공통 컴포넌트
- [x] 반응형: 데스크탑 2x2, 1024px 이하 1열 스택
- [x] 다크 모드 패널 스타일 적용

**검증**: 768/1024/1440px에서 모두 정상 표시.

### M4 — 마켓 페이지 + 캔들 차트 (3~4일) ✅ 완료
- [x] `/market` 리스트 (검색·필터·offset 페이징, DataTable)
- [x] `/market/[symbol]` 상세
- [x] **lightweight-charts CandleChart 구현** (사용자 지적 사항 해결의 핵심)
- [x] interval 토글 (1m/5m/15m/1h/4h/1d)
- [x] 지표 오버레이 (EMA20/EMA50) — IndicatorOverlayControls 연결
- [x] SSE 연결로 라이브 캔들 갱신 (mock: 2초 인터벌 시뮬레이션)
- [x] 차트 무한 스크롤 (좌측 끝 도달 시 과거 데이터 prepend)
- [x] OHLCV 툴팁 (crosshair move 구독)
- [x] ChartErrorBoundary 격리

**검증**: 캔들이 표준 거래소 형태로 표시. 줌/팬/툴팁 정상. SSE 끊김 시 자동 재연결.

### M5 — 워치리스트 + 알람 (2~3일) ✅ 완료
- [x] `/watchlist` 관리 화면 (추가/삭제)
- [x] `/alerts` 목록 + 발화 이력 (탭 분리)
- [x] `/alerts/new` 규칙 생성 폼
- [x] `/alerts/[id]` 규칙 편집 폼
- [x] zod v4 + react-hook-form 검증 (라벨/threshold/cooldown/채널)
- [x] mock 발화 시뮬레이션 (8초마다 활성 규칙 랜덤 발화)

**검증**: 규칙 생성 → 목록 표시 → 편집 → 비활성화 → 삭제 전 흐름.

### M6 — 인증 + API 키 관리 (2~3일) ✅ 완료
- [x] `/login`, `/signup` (zod + react-hook-form)
- [x] Zustand auth store + localStorage 토큰 처리
- [x] 보호된 라우트 ProtectedRoute (`/watchlist`, `/alerts`, `/api-keys`, `/settings`)
- [x] `/api-keys` 바이낸스 스타일 화면 (활성/비활성, IP 제한, 사용량 바)
- [x] 키 생성 다이얼로그 (3단계, secret 1회 표시)
- [x] 권한 스코프 picker (6개 스코프)
- [x] 사용량 통계 (일일 요청/한도 progress bar)

**검증**: 로그아웃 상태로 `/api-keys` 접근 → 로그인 페이지 리다이렉트. 키 생성 시 secret이 닫은 후 다시 보이지 않음.

### M7 — API 문서 페이지 (2일) ✅ 완료
- [x] OpenAPI 엔드포인트 fixture (13개 엔드포인트)
- [x] 좌측 트리 (태그별 그룹, 열기/닫기) + 우측 본문 레이아웃
- [x] Endpoint Detail (method badge, path, params table, response schema)
- [x] 4가지 코드 예시 탭 (curl / JavaScript / Python / Java) + 복사 버튼
- [x] 검색 기능 (path/summary/tag 필터)
- [x] RFC 7807 ProblemDetail 에러 응답 섹션

**검증**: 모든 백엔드 엔드포인트 표시, 검색 정확, 코드 복사 동작.

### M8 — 다듬기 (2~3일)
- [ ] 접근성 audit (Lighthouse, axe-core)
- [ ] 키보드 네비게이션 점검
- [ ] 다크/라이트 모드 전체 페이지 시각 검증
- [ ] 에러 바운더리 시나리오 테스트
- [ ] SEO 메타 태그
- [ ] og:image
- [ ] 빌드 사이즈 분석

**검증**: Lighthouse 점수 Performance/Accessibility/Best Practices 모두 90 이상.

---

## 14. 백엔드와의 합의 필요 사항 (사용자 → 백엔드 작업으로 이관)

본 프로젝트가 화면만 책임지지만, 진행 중 백엔드 측 결정이 필요한 항목을 별도 표시:

| # | 항목 | 현재 상태 | 화면 측 가정 |
|---|---|---|---|
| 1 | 인증 방식 | 미정 (`api/_PLAN.md`엔 JWT 계획) | JWT, accessToken in memory + refreshToken httpOnly cookie |
| 2 | API Key 모델 | 미정 | 라벨 / 스코프 / IP whitelist / cooldown / 사용량 |
| 3 | 권한 스코프 목록 | 미정 | §7 1차안 |
| 4 | 알람 규칙 모델 | 미정 | §9 1차안 |
| 5 | 워치리스트 동기화 | 미정 | localStorage → 서버 머지 |
| 6 | SSE 인증 | 미정 (현재 permitAll) | 쿼리 토큰 또는 헤더 (EventSource는 헤더 직접 못 보냄 → URL token) |
| 7 | CORS | dev 와일드카드 | prod 화이트리스트 |
| 8 | OpenAPI 노출 | dev 프로파일에서만 | API 문서 페이지는 빌드 시 정적 import 권장 |

→ 화면 측은 위 가정으로 진행. 백엔드 결정 후 변경되면 어댑터 레이어(`lib/api/*`)만 수정.

---

## 15. 사용자가 직접 진행할 부분 (재확인)

화면 구현 후 사용자가 진행:

1. **백엔드 실연결**: `NEXT_PUBLIC_USE_MOCK=false`로 전환, baseURL 실제 값 주입, CORS 합의
2. **외부 API 키 발급**: finnhub / goldapi 등 (선택, mock으로도 시연 가능)
3. **알람/워치리스트/인증 백엔드 모듈 추가**: 위 §14 합의 후
4. **배포**: Vercel 또는 자체 호스팅
5. **도메인 / SSL / OG 이미지 등 운영 작업**

---

## 16. 금지 / 주의

- 화면 측 코드에 **API 시크릿 직접 박지 않음**. `.env.local`만.
- BigDecimal `Number` 변환은 **차트/표시 용도로만**. 계산은 문자열 또는 decimal.js.
- 백엔드 endpoint 상수는 `lib/api/endpoints.ts` **한 곳에서만 관리**. 컴포넌트에 하드코딩 금지.
- SSE 이벤트명, 토픽명, Redis 키, 페이지 envelope 필드명은 **백엔드 컨벤션 그대로**.
- 라이브러리 추가 전 필요성 점검. shadcn 패턴(복사 기반)을 우선, 무거운 라이브러리 회피.
- `any` 타입 금지 (tsconfig strict + noImplicitAny).
- `localStorage` 직접 접근 금지. 항상 wrapper (`lib/store/`)를 거침.
- 환율/김프 등 외부 API 실패가 페이지 전체를 죽이지 않도록 **반드시 ErrorBoundary 격리**.

---

## 17. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-12 | 최초 작성 (기술 스택, 17개 섹션, 8단계 마일스톤 확정) |
| 2026-05-13 | M4 완료: LwCandleChart(EMA 오버레이/OHLCV 툴팁/라이브갱신/무한스크롤), MarketListPage, MarketDetailPage |
| 2026-05-13 | M5 완료: AlertsPage/AlertNewPage/AlertDetailPage(zod+react-hook-form), WatchlistPage |
| 2026-05-13 | M6 완료: LoginPage/SignupPage/authStore/ProtectedRoute, ApiKeysPage(3단계 다이얼로그) |
| 2026-05-13 | M7 완료: ApiDocsPage(13개 엔드포인트, 4종 코드예시, 검색) |

---

## 검증 포인트

본 plan을 기준으로 작업 시작 전·각 마일스톤 종료 시 확인:

### plan 단계 (지금)
- [ ] 사용자가 기술 스택(특히 Next.js + lightweight-charts) 합의
- [ ] 외부 데이터를 1차 mock으로 진행하는 데 합의
- [ ] 백엔드 미구현 영역(Alert / Watchlist / Auth / ApiKey)을 mock 인터페이스로 풀 시연하는 방향에 합의
- [ ] §14의 백엔드 합의 사항을 인지 (화면 측 가정대로 선진행)

### M1 (스켈레톤) 종료 전
- [ ] `npm run dev` 시 모든 라우트 404 없이 응답
- [ ] 다크/라이트 토글 동작, hydration flash 없음
- [ ] strict tsconfig 통과, `any` 사용 0건
- [ ] mock 분기 동작 확인 (`USE_MOCK=true`로 전체 mock, `false`로 실호출 시도 → 401/connection refused)
- [ ] Lighthouse Best Practices 90 이상

### M2 (글로벌 바) 종료 전
- [ ] 6개 위젯 모두 mock으로 정상 표시
- [ ] 한 위젯 강제 실패 시 다른 5개 정상 + 해당 위젯만 `—`
- [ ] 트림 평균 김프 유틸 단위 테스트 통과 (입력 3, 4, 5개 케이스)
- [ ] CLS = 0 (Lighthouse)

### M4 (캔들 차트) 종료 전
- [ ] **양봉/음봉이 표준 거래소 형태로 표시**
- [ ] 마우스 휠 줌, 드래그 팬 동작
- [ ] 크로스헤어 + OHLCV 툴팁
- [ ] interval 전환 시 차트 깨짐 없음
- [ ] 좌측 끝 도달 시 과거 데이터 prepend (무한 스크롤)
- [ ] SSE close 이벤트 수신 시 마지막 캔들 갱신/새 캔들 추가 정상
- [ ] 부모 컨테이너 리사이즈 시 차트 재배치
- [ ] 차트 강제 에러 발생 시 `ChartErrorBoundary`로 격리, 페이지 다른 영역 정상

### M6 (API 키) 종료 전
- [ ] 키 생성 시 secret이 처음이자 마지막 1회 표시
- [ ] "복사 완료" 체크 전엔 닫기 비활성
- [ ] 다이얼로그 닫은 후 secret 어디서도 표시 안 됨
- [ ] 권한 스코프 picker가 백엔드 변경 시 한 곳만 수정으로 끝나는 구조
- [ ] 사용량 통계 차트 정상 렌더

### M7 (API 문서) 종료 전
- [ ] 모든 백엔드 엔드포인트 표시
- [ ] 검색 정확도 (path, summary, tag)
- [ ] 코드 예시 4종 모두 정상 highlight + 복사
- [ ] RFC 7807 ProblemDetail 응답이 별도 섹션으로 표시

### 전체 종료 시
- [ ] `npm run build` 성공
- [ ] `npm run lint` 0 warning
- [ ] `npm run test` 통과
- [ ] Lighthouse Performance / Accessibility / Best Practices 90+
- [ ] 모바일 / 태블릿 / 데스크탑 모두 깨짐 없음
- [ ] 백엔드 실호출로 전환 시 환경변수 변경만으로 동작