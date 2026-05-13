# 프리미엄 랭킹 수정 가이드

이 문서는 프론트엔드가 익숙하지 않은 백엔드 주니어 기준으로, 현재 대시보드의 프리미엄 랭킹을 어디서 수정해야 하는지 빠르게 찾기 위한 보조 가이드입니다.

## 현재 화면 기준

대시보드의 프리미엄 랭킹은 기본적으로 아래 조합을 보여줍니다.

```text
국내 거래소: Upbit
해외 페어: Binance Futures
선물 기한: 무기한
```

테이블 컬럼은 아래 순서입니다.

```text
자산
현재가 1: 국내 거래소 기준 가격, 현재는 KRW
현재가 2: 해외 거래소 기준 가격, 현재는 USD
매수 프리미엄
매도 프리미엄
24H 표준편차
24H 평균
거래량
업데이트
```

## 주요 파일

프리미엄 랭킹을 수정할 때 가장 먼저 볼 파일은 아래 네 개입니다.

```text
src/features/premium/model/premiumViewTypes.ts
src/features/premium/model/premiumFilters.ts
src/features/premium/api/premiumApi.ts
src/features/premium/components/PremiumTable.tsx
```

역할은 이렇게 나뉩니다.

```text
premiumViewTypes.ts
  화면에서 쓰는 프리미엄 row 타입과 정렬 가능한 컬럼 정의

premiumFilters.ts
  필터 상태, 기본값, 필터링/정렬 로직

premiumApi.ts
  현재는 mock 데이터
  나중에는 백엔드 REST API 호출 또는 DTO mapper가 들어갈 위치

PremiumTable.tsx
  실제 테이블 컬럼과 row 렌더링
```

## 필터 수정 위치

검색/조건 필터 UI는 여기에 있습니다.

```text
src/features/premium/components/PremiumFilterBar.tsx
```

현재 지원하는 필터는 아래와 같습니다.

```text
코인명
국내 거래소
해외 페어
선물 기한
매수 프리미엄 이상
매수 프리미엄 이하
24H 표준편차 이상
24H 평균 이상
거래량 이상(B)
```

새 필터를 추가할 때는 보통 이 순서로 수정합니다.

1. `PremiumFilters` 타입에 필드를 추가합니다.
2. `defaultPremiumFilters`에 기본값을 추가합니다.
3. `PremiumFilterBar.tsx`에 input 또는 select를 추가합니다.
4. `filterAndSortPremiumPairs()`에 실제 필터 조건을 추가합니다.

## 백엔드 API를 붙일 때

백엔드 응답 DTO는 바로 화면 컴포넌트에 넘기지 않는 편이 좋습니다.

추천 흐름은 아래와 같습니다.

```text
백엔드 DTO
  -> mapper
  -> PremiumPairView
  -> PremiumTable / MarketDetailPage
```

이렇게 나누면 백엔드 필드명이 바뀌어도 화면 전체를 고치지 않고 mapper만 수정할 수 있습니다.

예상 위치는 아래입니다.

```text
src/features/premium/api/premiumTypes.ts
src/features/premium/model/premiumMappers.ts
```

## 랭킹 클릭 후 차트 페이지 이동 판단

랭킹 row를 클릭하면 차트 상세 화면으로 이동하는 현재 방향은 좋은 판단입니다.

이유는 단순합니다.

```text
랭킹: 어떤 코인을 볼지 고르는 화면
차트: 선택한 코인을 깊게 분석하는 화면
```

랭킹 테이블 안에 차트, 이벤트, 상세 지표를 모두 넣으면 대시보드가 금방 복잡해집니다. 지금처럼 row 클릭으로 차트 상세 화면에 보내면 대시보드는 빠르게 훑는 용도, 차트 화면은 분석 용도로 역할이 분리됩니다.

관련 코드는 여기에 있습니다.

```text
src/app/App.tsx
src/pages/DashboardPage.tsx
src/features/premium/components/PremiumTable.tsx
src/pages/MarketDetailPage.tsx
```

`App.tsx`의 `selectPair()`가 선택된 row를 저장하고 `detail` 화면으로 전환합니다.

## 이름 정리 추천

현재 상세 화면 파일명은 `MarketDetailPage.tsx`입니다. 기능이 점점 차트 중심으로 커진다면 나중에 아래처럼 이름을 바꿔도 좋습니다.

```text
MarketDetailPage.tsx -> ChartPage.tsx
```

다만 지금은 아직 MVP 단계라, 동작이 안정된 뒤 이름을 바꾸는 편이 더 안전합니다.

