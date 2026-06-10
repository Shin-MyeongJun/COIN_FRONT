/**
 * 백엔드 economic 모듈 DTO.
 *
 * 화면에 직접 쓰지 말 것 → model/economicMappers.ts 의 ViewModel(TimelineMarker 등)로 변환.
 * 백엔드 표기(특히 severity/category 문자열·금액 string)는 확정 전이므로 필드는 optional + 관대한 타입.
 * 시간은 epoch milliseconds(number, UTC), 금액·수치는 정밀도 보존을 위해 string(BigDecimal).
 */

/** GET /api/v1/economic/calendar (?fromTs=&toTs=) */
export interface EconomicCalendarDto {
  id?: number
  code?: string
  title?: string
  /** epoch milliseconds (UTC) */
  eventTs?: number
  /** 'HIGH' | 'MEDIUM' | 'LOW' 또는 importance 숫자/뉴스 표기 — mapper에서 정규화 */
  severity?: string
  /** 'economic' | 'exchange' | 'news' | 'regulation' | 'system' 등 — mapper에서 type 결정 */
  category?: string
  source?: string
  country?: string
}

/** GET /api/v1/economic/indicators (?category=) */
export interface EconomicIndicatorDto {
  codeId?: number
  code?: string
  name?: string
  category?: string
  country?: string
  /** BigDecimal — 정밀도 보존 위해 string */
  value?: string
  previousValue?: string
  unit?: string
  /** epoch milliseconds (UTC) */
  updatedAt?: number
}

/** GET /api/v1/economic/correlation (?asset=) */
export interface EconomicCorrelationDto {
  asset?: string
  indicatorCode?: string
  indicatorName?: string
  /** 상관계수 [-1, 1], BigDecimal string */
  coefficient?: string
  windowDays?: number
  /** epoch milliseconds (UTC) */
  computedAt?: number
}
