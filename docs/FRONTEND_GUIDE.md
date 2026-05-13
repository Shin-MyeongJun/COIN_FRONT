# CoinData Web Frontend Guide

이 문서는 프론트엔드를 처음 만지는 백엔드 주니어 개발자가 CoinData Web을 안전하게 수정할 수 있도록 만든 작업 가이드입니다.

목표는 React를 깊게 공부하기 전에, "어느 파일을 왜 고쳐야 하는지"를 빠르게 파악하는 것입니다.

## 1. 먼저 기억할 것

CoinData Web은 일반 코인 가격 사이트가 아닙니다.

- 핵심 화면은 김치 프리미엄 모니터링 대시보드입니다.
- 매수 프리미엄과 매도 프리미엄은 반드시 분리해서 보여줍니다.
- 첫 화면은 랜딩 페이지가 아니라 바로 사용할 수 있는 대시보드입니다.
- 프리미엄 히트맵, 로그인, 관심 목록, 알림 UI는 현재 MVP 범위가 아닙니다.
- 백엔드 API와 SSE는 `features/*/api` 아래에서만 연결합니다.
- 화면 컴포넌트에서 `fetch`를 직접 호출하지 않습니다.

## 2. 실행 방법

개발 서버:

```powershell
npm run dev
```

빌드 검증:

```powershell
npm run build
```

브라우저에서 보통 아래 주소로 확인합니다.

```text
http://127.0.0.1:5173
```

현재 프로젝트는 Vite + React + TypeScript입니다.

참고: 이 PC에서 일반 `npm` 실행이 깨지는 경우가 있었습니다. 그럴 때는 아래처럼 Node의 npm CLI를 직접 호출하면 됩니다.

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run build
```

## 3. React를 백엔드 관점으로 이해하기

React 컴포넌트는 "HTML을 반환하는 함수"라고 생각하면 됩니다.

```tsx
function UserCard({ name }: { name: string }) {
  return <div>{name}</div>
}
```

백엔드와 비교하면 대략 이렇습니다.

| 백엔드 느낌 | 프론트 느낌 |
| --- | --- |
| Controller | Page component |
| Service | model function / hook |
| DTO | api type |
| Domain view model | `*View` type |
| Repository/API client | `features/*/api/*Api.ts` |
| Thymeleaf/JSP template | React component JSX |
| application.yml property | `src/shared/config/env.ts` |

중요한 React 개념은 세 가지입니다.

### props

부모 컴포넌트가 자식 컴포넌트에 넘기는 입력값입니다.

```tsx
<PremiumTable pairs={filteredPairs} onSort={toggleSort} />
```

여기서 `pairs`, `onSort`가 props입니다.

### state

사용자 입력이나 화면 상태처럼 바뀌는 값입니다.

```tsx
const [view, setView] = useState<View>('dashboard')
```

`view`는 현재 화면이고, `setView('detail')`을 호출하면 상세 화면으로 바뀝니다.

### derived data

원본 데이터를 필터/정렬해서 만든 값입니다. 현재는 `useMemo`로 계산합니다.

```tsx
const filteredPairs = useMemo(
  () => filterAndSortPremiumPairs({ pairs, filters, sortKey, sortDirection }),
  [filters, sortDirection, sortKey],
)
```

백엔드의 read model 가공 로직과 비슷하게 보면 됩니다.

## 4. 전체 진입 흐름

앱이 켜지는 순서는 아래와 같습니다.

```text
index.html
  -> src/main.tsx
  -> src/app/providers/QueryProvider.tsx
  -> src/app/App.tsx
  -> src/pages/*
  -> src/features/*
  -> src/shared/*
```

각 파일의 역할:

- `src/main.tsx`: React 앱을 DOM에 붙이는 진입점입니다.
- `src/app/App.tsx`: 현재 화면, 선택된 코인, 필터, 정렬 같은 앱 상태를 관리합니다.
- `src/pages/*Page.tsx`: 한 화면을 조립합니다. 큰 레이아웃만 담당합니다.
- `src/features/*`: 기능별 컴포넌트, API, 타입, 모델 로직을 둡니다.
- `src/shared/*`: 여러 기능에서 같이 쓰는 공통 코드입니다.
- `src/styles/tokens.css`: 색상, 테두리, 그림자 같은 디자인 토큰입니다.
- `src/styles/globals.css`: 실제 레이아웃과 컴포넌트 CSS입니다.

## 5. 현재 폴더 구조

```text
src/
  app/
    App.tsx
    router.tsx
    providers/
      QueryProvider.tsx

  pages/
    DashboardPage.tsx
    MarketDetailPage.tsx
    EconomicTimelinePage.tsx

  features/
    dashboard/
    premium/
    market/
    chart/
    stream/
    economic/
    news/

  shared/
    api/
    config/
    lib/
    types/
    ui/

  styles/
    globals.css
    tokens.css
```

## 6. 기능별 위치

### Dashboard

대시보드 상단, 전체 market stat, stream 상태 pill은 여기 있습니다.

```text
src/features/dashboard/components/
```

주요 파일:

- `DashboardHeader.tsx`: 브랜드와 화면 전환 버튼
- `MarketStatStrip.tsx`: 평균 프리미엄, 최고 프리미엄, 거래량 요약
- `StreamStatusPill.tsx`: SSE 연결 상태 표시

### Premium

김치 프리미엄 테이블, 필터, 정렬, mock 데이터는 여기 있습니다.

```text
src/features/premium/
```

주요 파일:

- `api/premiumApi.ts`: 프리미엄 API 경로와 mock 데이터
- `api/premiumTypes.ts`: 백엔드 DTO 타입
- `model/premiumViewTypes.ts`: 화면에서 쓰는 view model 타입
- `model/premiumFilters.ts`: 필터 타입, 기본값, 필터/정렬 함수
- `components/PremiumFilterBar.tsx`: 필터 UI
- `components/PremiumTable.tsx`: 프리미엄 테이블
- `components/PremiumMetricCell.tsx`: Buy/Sell 프리미엄 표시 셀
- `components/PremiumSparkline.tsx`: 작은 추세 그래프

### Market

시장 상세 화면에서 쓰는 pair header, 프리미엄 요약, bid/ask breakdown은 여기 있습니다.

```text
src/features/market/
```

주요 파일:

- `api/marketApi.ts`: chart composition API 경로와 mock candle
- `components/MarketPairHeader.tsx`
- `components/PremiumSummaryStrip.tsx`
- `components/PremiumBreakdownList.tsx`

### Chart

캔들 차트와 지표 overlay 관련 코드는 여기 있습니다.

```text
src/features/chart/
```

주요 파일:

- `model/chartTypes.ts`: candle, overlay state 타입
- `model/markerTypes.ts`: 경제/뉴스/거래소 이벤트 marker 타입
- `components/CandlestickChart.tsx`
- `components/IndicatorOverlayControls.tsx`
- `components/TimelineMarkers.tsx`
- `components/ChartToolbar.tsx`

### Economic / News

경제 이벤트와 뉴스 timeline marker는 현재 공통 marker shape을 사용합니다.

```text
src/features/economic/
src/features/news/
```

경제 API 경로는 `economic/api/economicApi.ts`에 있습니다.

### Stream

SSE 연결 경계입니다.

```text
src/features/stream/
```

주요 파일:

- `api/sseClient.ts`: EventSource 생성 공통 함수
- `api/premiumStream.ts`: `/api/v1/stream/premium`
- `api/tickStream.ts`: `/api/v1/stream/ticks`
- `api/candleStream.ts`: `/api/v1/stream/candles/close`
- `api/indicatorStream.ts`: `/api/v1/stream/indicators/close`
- `model/streamTypes.ts`: stream 상태 타입
- `model/streamStore.ts`: 현재는 간단한 초기 상태

## 7. 데이터 흐름

현재는 백엔드 연결 전이라 mock 데이터를 씁니다.

```text
features/*/api mock data
  -> app/App.tsx
  -> pages/*
  -> features/*/components
```

예를 들어 프리미엄 테이블은 아래 흐름입니다.

```text
getMockPremiumPairs()
  -> App.tsx
  -> filterAndSortPremiumPairs()
  -> DashboardPage
  -> PremiumTable
```

나중에 실제 API를 붙이면 목표 흐름은 이렇게 바뀝니다.

```text
backend REST
  -> features/premium/api/premiumApi.ts
  -> mapper
  -> PremiumPairView
  -> page/component
```

중요: 백엔드 DTO를 그대로 화면 컴포넌트에서 쓰지 말고, 화면용 `PremiumPairView`로 변환해서 사용하세요.

## 8. 백엔드 API 연결 지점

서버 `modules/api` 컨트롤러를 기준으로 현재 프론트에 반영한 주요 경로입니다.

### Premium REST

파일:

```text
src/features/premium/api/premiumApi.ts
```

경로:

```text
GET /api/v1/market/premium/ranking?n=10
GET /api/v1/market/premium/snapshot/{base}
GET /api/v1/market/premium/series
```

### Chart composition

파일:

```text
src/features/market/api/marketApi.ts
```

경로:

```text
GET /api/v1/compose/chart/{marketCodeId}
GET /api/v1/compose/market-overview/{marketCodeId}
GET /api/v1/market/ticks/latest
```

### Economic

파일:

```text
src/features/economic/api/economicApi.ts
```

경로:

```text
GET /api/v1/economic/calendar
GET /api/v1/economic/indicators
GET /api/v1/economic/correlation
```

### SSE

파일:

```text
src/features/stream/api/*
```

경로:

```text
GET /api/v1/stream/ticks
GET /api/v1/stream/premium
GET /api/v1/stream/premium-detail/raw
GET /api/v1/stream/candles/close
GET /api/v1/stream/indicators/close
```

## 9. REST API를 실제로 붙이는 방법

현재 `QueryProvider.tsx`는 placeholder입니다. 아직 `@tanstack/react-query`를 설치하지 않았습니다.

실제 REST 상태 관리를 붙일 때:

```powershell
npm install @tanstack/react-query
```

그 다음 `src/app/providers/QueryProvider.tsx`를 아래처럼 바꿉니다.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient()

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

그리고 feature 안에 hook을 둡니다.

예시 위치:

```text
src/features/premium/api/usePremiumRankingQuery.ts
```

예시 코드:

```tsx
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import { fetchPremiumRanking } from './premiumApi'

export function usePremiumRankingQuery(limit: number) {
  return useQuery({
    queryKey: queryKeys.premiumRanking(limit),
    queryFn: () => fetchPremiumRanking(limit),
  })
}
```

그 다음 page나 container에서 `data`, `isLoading`, `error`를 받아 화면에 넘깁니다.

## 10. DTO와 View Model 분리하기

백엔드 응답 타입은 `api/*Types.ts`에 둡니다.

예:

```text
src/features/premium/api/premiumTypes.ts
```

화면에서 쓰는 타입은 `model/*ViewTypes.ts`에 둡니다.

예:

```text
src/features/premium/model/premiumViewTypes.ts
```

변환 함수는 `model/*Mappers.ts`에 둡니다.

예:

```tsx
export function toPremiumPairView(dto: PremiumRankingDto): PremiumPairView {
  return {
    asset: dto.symbol,
    buyPremiumRate: dto.buyPremiumRate ?? dto.premiumRate ?? 0,
    sellPremiumRate: dto.sellPremiumRate ?? dto.premiumRate ?? 0,
    // 나머지 필드 매핑
  }
}
```

이렇게 분리해야 백엔드 응답 필드명이 바뀌어도 UI 전체를 뜯지 않고 mapper만 고칠 수 있습니다.

## 11. 자주 하는 수정 레시피

### 11.1 프리미엄 테이블 컬럼 추가

1. 화면용 타입에 필드를 추가합니다.

```text
src/features/premium/model/premiumViewTypes.ts
```

2. mock 데이터에 값을 추가합니다.

```text
src/features/premium/api/premiumApi.ts
```

3. 실제 API 연결 중이면 mapper도 수정합니다.

```text
src/features/premium/model/premiumMappers.ts
```

4. 테이블 header와 row cell을 추가합니다.

```text
src/features/premium/components/PremiumTable.tsx
```

5. 정렬 가능한 컬럼이면 `PremiumSortKey`, `premiumSortLabels`, `filterAndSortPremiumPairs` 동작을 확인합니다.

```text
src/features/premium/model/premiumViewTypes.ts
src/features/premium/model/premiumFilters.ts
```

### 11.2 필터 추가

1. 필터 타입과 기본값을 추가합니다.

```text
src/features/premium/model/premiumFilters.ts
```

2. 필터 UI를 추가합니다.

```text
src/features/premium/components/PremiumFilterBar.tsx
```

3. 실제 filtering 조건을 추가합니다.

```text
src/features/premium/model/premiumFilters.ts
```

4. 필요하면 API query param에도 추가합니다.

```text
src/features/premium/api/premiumApi.ts
```

### 11.3 차트 표시를 바꾸기

캔들 차트 자체:

```text
src/features/chart/components/CandlestickChart.tsx
```

차트 데이터 타입:

```text
src/features/chart/model/chartTypes.ts
```

마커 타입:

```text
src/features/chart/model/markerTypes.ts
```

차트 API 경로:

```text
src/features/market/api/marketApi.ts
```

주의: 나중에 `lightweight-charts`를 도입하면 `CandlestickChart.tsx` 내부 구현만 교체하고, props shape은 최대한 유지하세요.

### 11.4 새 페이지 추가

1. page 파일을 추가합니다.

```text
src/pages/NewPage.tsx
```

2. view type을 추가합니다.

```text
src/app/router.tsx
```

3. header 버튼을 추가합니다.

```text
src/features/dashboard/components/DashboardHeader.tsx
```

4. `App.tsx`에서 조건부 렌더링을 추가합니다.

```text
src/app/App.tsx
```

현재는 실제 router library를 쓰지 않고 `view` state로 화면을 바꿉니다. URL 기반 라우팅이 필요해지면 `react-router-dom` 도입을 검토하세요.

### 11.5 디자인 색상 바꾸기

색상, 선, 그림자, 배경은 여기서 바꿉니다.

```text
src/styles/tokens.css
```

레이아웃, 테이블, 버튼, 차트 SVG 스타일은 여기서 바꿉니다.

```text
src/styles/globals.css
```

주의: 컴포넌트 파일 안에 inline style을 많이 넣지 마세요. 나중에 전체 톤을 바꾸기 어려워집니다.

### 11.6 SSE 연결하기

SSE는 `EventSource`를 씁니다.

공통 생성 함수:

```text
src/features/stream/api/sseClient.ts
```

프리미엄 스트림:

```text
src/features/stream/api/premiumStream.ts
```

처음 붙일 때는 아래 순서가 좋습니다.

1. `premiumStream.ts`에서 EventSource 연결
2. stream 상태 타입 확장
3. `StreamStatusPill`에 connected/reconnecting/stale 표시
4. premium row update logic 추가
5. 변경된 row highlight 추가

컴포넌트 안에서 직접 `new EventSource(...)`를 여러 번 만들지 마세요. 연결이 중복되고 정리가 어려워집니다.

## 12. 현재 mock 데이터 위치

현재 앱은 백엔드 없이도 화면을 볼 수 있도록 mock 데이터를 사용합니다.

프리미엄:

```text
src/features/premium/api/premiumApi.ts
```

캔들:

```text
src/features/market/api/marketApi.ts
```

경제/뉴스 마커:

```text
src/features/economic/api/economicApi.ts
```

실제 API를 붙여도 mock 함수는 잠깐 남겨두는 편이 좋습니다. 백엔드가 꺼져 있을 때 UI 작업을 계속할 수 있습니다.

## 13. TypeScript 에러 읽는 법

가장 흔한 에러는 세 가지입니다.

### Cannot find module

import 경로가 틀린 경우입니다.

```text
Cannot find module '../features/...'
```

파일 위치 기준으로 `../` 개수를 확인하세요.

### Type is not assignable

넘긴 props 타입이 컴포넌트가 기대하는 타입과 다릅니다.

예:

```text
Type 'string' is not assignable to type 'number'
```

보통 DTO 값을 view model로 변환하지 않고 직접 넘겼을 때 발생합니다.

### Property does not exist

타입에 없는 필드를 사용한 경우입니다.

예:

```text
Property 'buyPremiumRate' does not exist on type 'PremiumRankingDto'
```

이 경우 백엔드 DTO 타입과 화면용 `PremiumPairView`를 구분하세요.

## 14. 수정 전 체크리스트

작업 전에 확인하세요.

- 이 변경은 어느 feature에 속하는가?
- API 타입을 바꾸는가, 화면용 view model을 바꾸는가?
- mock 데이터도 같이 업데이트했는가?
- `npm run build`가 통과하는가?
- 첫 화면이 여전히 대시보드인가?
- Buy Premium과 Sell Premium이 계속 분리되어 보이는가?
- MVP 제외 범위인 로그인/알림/관심목록을 건드리지 않았는가?

## 15. 추천 작업 순서

프론트가 익숙하지 않다면 아래 순서로 작업하세요.

1. mock 데이터로 화면 모양을 먼저 맞춥니다.
2. view model 타입을 확정합니다.
3. 컴포넌트 props를 정리합니다.
4. mapper를 만듭니다.
5. REST API를 연결합니다.
6. loading, empty, error 상태를 추가합니다.
7. SSE 실시간 업데이트를 붙입니다.
8. 마지막에 CSS를 다듬습니다.

이 순서가 안전한 이유는, API 연결과 디자인 수정을 동시에 하면 어디서 깨졌는지 찾기 어려워지기 때문입니다.

## 16. 지금 코드에서 가장 먼저 개선하면 좋은 것

현재 구조는 작업 가능한 상태지만, 다음 단계에서 아래를 추천합니다.

1. `@tanstack/react-query` 설치 후 `QueryProvider` 실제 구현
2. `premiumApi.ts` mock과 실제 fetch를 분리
3. 백엔드 `PremiumRankingView` 실제 필드 기준으로 mapper 작성
4. loading/error/empty UI 공통화
5. SSE store를 Zustand 또는 React state로 정리
6. `lightweight-charts`로 현재 SVG 캔들 차트 교체

## 17. 파일을 고를 때의 기준

헷갈리면 이 규칙을 따르세요.

```text
화면 전체 조립이다        -> pages/*
특정 기능 UI다           -> features/{feature}/components/*
백엔드 호출이다          -> features/{feature}/api/*
화면용 타입이다          -> features/{feature}/model/*
여러 feature가 같이 쓴다 -> shared/*
색상/간격/레이아웃이다   -> styles/*
```

그리고 제일 중요한 규칙:

```text
컴포넌트는 최대한 화면만 담당하고,
데이터 호출/변환/필터링은 api 또는 model 쪽으로 빼세요.
```

