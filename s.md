역할: 이 프로젝트(coin_front)의 시니어 React/TypeScript 프론트엔드 개발자

작업: DashboardPage 4분할 레이아웃 재구성 + 헤더-패널 간 지표 중복 제거

────────────────────────────────────────
현재 상태 (확인된 사실)
────────────────────────────────────────
- src/pages/DashboardPage.tsx
  · 상단(.dashboard-top-grid): [좌] WatchlistPanel / [우] AlertPanel
  · 하단(.dashboard-bottom-grid 1.6fr : 1fr): [좌] PremiumTable / [우] EconomicTimeline
- src/features/dashboard/components/DashboardHeader.tsx
  · topbar의 ticker-strip 내부에 `USDT/KRW`, `평균 김프`, `Fear & Greed` TickerItem 존재 → GlobalIndicatorBar와 중복
- src/features/globalBar/components/GlobalIndicatorBar.tsx
  · USD/KRW, 평균김프, 나스닥, 금/은, 미 10Y, 공포·탐욕 (= 헤더라인, 유지)
- src/features/news/
  · api/newsApi.ts만 존재(getMockNewsTimeline는 빈 배열 반환). 컴포넌트 없음.

────────────────────────────────────────
목표 레이아웃
────────────────────────────────────────
좌측 컬럼(2·3사분면, full height) = 🔥 프리미엄 순위 (PremiumFilterBar + PremiumTable)
우측 컬럼:
· 1사분면(우상) = 📌 관심 + 🔔 알람 통합 패널
· 4사분면(우하) = 📰 뉴스 패널

ASCII:
┌──────────────────┬──────────────────┐
│                  │  관심 + 알람      │
│   프리미엄        ├──────────────────┤
│   (full height)  │  뉴스             │
└──────────────────┴──────────────────┘

────────────────────────────────────────
필수 규칙 (프론트 전용)
────────────────────────────────────────
1. 폴더 컨벤션 유지: pages/ · features/<domain>/{api,model,components}/ · shared/
2. 화면 컴포넌트에서 fetch 직접 호출 금지 — mock/실호출은 features/*/api 경유
3. 백엔드 DTO를 화면 컴포넌트에 직접 쓰지 말고 *View 모델로 변환
4. 기존 SSE/스토어/라우팅 시그니처 변경 금지 (WatchlistPanel, AlertPanel, PremiumTable 등의 props 유지)
5. 스타일은 src/styles/globals.css에 추가 (CSS-in-JS 도입 금지). 1024px 이하 1열 스택 반응형 유지
6. 다크 모드 토큰(var(--surface), var(--line), var(--muted) 등) 사용
7. 헤더 라인의 GlobalIndicatorBar는 유지(=중복 제거 시 살리는 쪽)

────────────────────────────────────────
구체 작업
────────────────────────────────────────
[A] DashboardPage.tsx 레이아웃 재구성
- .dashboard-top-grid / .dashboard-bottom-grid 제거
- 새 그리드 클래스 .dashboard-mosaic-v2 도입
  · grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  · 좌측 article: grid-row: 1 / span 2 (full height)
  · 우측 상단/하단 각각 article
- 기존 EconomicTimeline 패널 제거 → NewsPanel로 교체

[B] 관심+알람 통합 패널 신규
- 신규 파일: src/features/dashboard/components/WatchlistAlertPanel.tsx
- 한 카드 안에 상/하 2섹션 (탭 아님). 각 섹션 헤더: 📌 관심 목록 / 🔔 알람 발화 이력
- 내부적으로 기존 <WatchlistPanel /> 과 <AlertPanel /> 컴포넌트를 그대로 컴포지션 (props 추가 변경 없음)
- "전체 보기" 버튼은 알람 섹션 헤더에 유지 → navigate('/alerts')

[C] 뉴스 패널 신규
- 신규 파일: src/features/news/components/NewsPanel.tsx
- 신규 파일: src/features/news/api/newsTypes.ts 확인/보강 (제목/시각/소스/severity)
- getMockNewsTimeline() 가 빈 배열이므로 mock 5건 추가 (id/timestamp/title/source/severity)
- 뉴스 미연결 상태이므로 features/news/api/newsApi.ts에서만 mock 처리, 컴포넌트는 빈 상태/로딩 처리 포함
- 카드 헤더: 📰 뉴스, '전체 보기' 버튼은 일단 비활성(추후 라우트 추가 시 연결)

[D] ticker-strip 제거 (DashboardHeader.tsx)
- ticker-strip 제거

[E] CSS (src/styles/globals.css)
- 신규 .dashboard-mosaic-v2 그리드 규칙 추가
- 신규 .watchlist-alert-card 의 내부 섹션 구분선/간격
- 신규 .news-card / .news-row 스타일
- @media (max-width: 1024px) 에서 1열 스택 (좌측 prem 먼저 → 관심+알람 → 뉴스 순)

────────────────────────────────────────
출력 규칙
────────────────────────────────────────
- 파일 경로는 src/ 부터 표시
- import 전체 경로 명시 (상대경로 깊이는 기존 코드와 동일하게)
- "신규 파일"과 "수정 필요한 기존 파일"을 별도 섹션으로 구분
- 각 코드 블록 위에 파일 경로 헤더 (예: `src/pages/DashboardPage.tsx`)
- 변경 후 의도가 깨질 위험이 있는 곳에는 `// NOTE:` 주석
- 코드 마지막에 "검증 포인트" 섹션 추가
  · 1440 / 1024 / 768px 반응형 깨짐 여부
  · GlobalIndicatorBar의 6위젯이 헤더에서만 보이는지
  · WatchlistPanel/AlertPanel/PremiumTable 기존 props 시그니처가 그대로인지
  · npm run build / tsc --noEmit 통과 여부

────────────────────────────────────────
금지
────────────────────────────────────────
- 외부 CSS 프레임워크/CSS-in-JS 추가 도입 금지
- WatchlistPanel, AlertPanel, PremiumTable의 props 시그니처 변경 금지
- features/economic 코드 삭제 금지 (EconomicTimeline은 /economic 페이지에서 계속 사용)
- 화면 컴포넌트에서 fetch 직접 호출 금지
- 환경변수/API 키 코드 직접 삽입 금지