/**
 * Global-bar 외부 위젯 데이터 소스 — 결정: **mock 유지**.
 *
 * 후보는 두 가지였다:
 *
 *   (a) 브라우저에서 외부 API 직접 호출
 *       (Finnhub Nasdaq, GoldAPI, US Treasury, alternative.me Fear&Greed, ExchangeRate)
 *       → ✘ CORS 문제 + 위 키들이 `VITE_*` 변수로 번들에 박혀 클라이언트에 노출
 *
 *   (b) 백엔드에 프록시 엔드포인트(`/api/v1/market/fx/latest` 등) 추가 후 BFF 호출
 *       → ◯ 보안/CORS 깨끗. 다만 현재 백엔드에 이 모듈이 없음(M-external 마일스톤 대상)
 *
 * 결정: 모든 외부 위젯은 운영에서도 mock 정적값을 표시한다.
 *  - VITE_USE_MOCK_EXTERNAL=true 를 기본값으로 권장(.env.production 도 동일)
 *  - GlobalIndicatorBar 는 이 mock 함수를 직접 호출하므로 운영 빌드에서 외부 호출이 발생하지 않음
 *  - 백엔드에 프록시 엔드포인트가 추가되는 시점에 이 파일이 통째로 deprecated 되고,
 *    `globalBar/api/externalApi.ts` + `env.useMockExternal` 분기로 교체된다.
 */

export type NasdaqData = { value: number; change: number; changePercent: number }
export type MetalData = { gold: number; silver: number; goldChange: number; silverChange: number }
export type TreasuryData = { yield10y: number; change: number }
export type FearGreedData = { value: number; label: string }
export type FxData = { usdKrw: number; change: number }

export function getMockNasdaq(): NasdaqData {
  return { value: 19_234.5, change: 142.3, changePercent: 0.75 }
}

export function getMockMetals(): MetalData {
  return { gold: 3_248.4, silver: 32.85, goldChange: 0.42, silverChange: -0.18 }
}

export function getMockTreasury(): TreasuryData {
  return { yield10y: 4.28, change: -0.03 }
}

export function getMockFearGreed(): FearGreedData {
  return { value: 63, label: 'Greed' }
}

export function getMockFxRate(): FxData {
  return { usdKrw: 1_382.5, change: -3.2 }
}

export function getMockAveragePremium(): { rate: number; change: number } {
  return { rate: 3.87, change: -0.12 }
}
