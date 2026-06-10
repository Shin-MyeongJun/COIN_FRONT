import { getJson } from '../../../shared/api/httpClient'
import { env } from '../../../shared/config/env'
import type { TimelineMarker } from '../../chart/model/markerTypes'
import { mapCalendarToMarkers } from '../model/economicMappers'
import type {
  EconomicCalendarDto,
  EconomicCorrelationDto,
  EconomicIndicatorDto,
} from './economicTypes'

const now = Date.now()

export const economicApiPaths = {
  calendar: '/api/v1/economic/calendar',
  indicators: '/api/v1/economic/indicators',
  correlation: '/api/v1/economic/correlation',
}

export function getMockTimelineMarkers(): TimelineMarker[] {
  return [
    {
      id: 'cpi',
      timestamp: now - 5_400_000,
      type: 'ECONOMIC',
      title: '미국 CPI 발표 이후 달러 변동성 확대',
      severity: 'HIGH',
      source: '경제 캘린더',
    },
    {
      id: 'fomc',
      timestamp: now - 3_240_000,
      type: 'ECONOMIC',
      title: '미국 장 마감 부근 FOMC 의사록 공개 예정',
      severity: 'MEDIUM',
      source: '연준 일정',
    },
    {
      id: 'exchange',
      timestamp: now - 1_560_000,
      type: 'EXCHANGE',
      title: 'BTC/KRW 추정 페어에서 바이낸스 호가 스프레드 확대',
      severity: 'MEDIUM',
      source: '실시간 스트림',
    },
    {
      id: 'news',
      timestamp: now - 960_000,
      type: 'NEWS',
      title: 'ETF 자금 흐름 뉴스와 프리미엄 확대가 동시 발생',
      severity: 'LOW',
      source: '뉴스 타임라인',
    },
  ]
}

export function fetchEconomicCalendar(fromTs: number, toTs: number) {
  return getJson<EconomicCalendarDto[]>(economicApiPaths.calendar, { fromTs, toTs })
}

export function fetchEconomicIndicators(category?: string) {
  return getJson<EconomicIndicatorDto[]>(economicApiPaths.indicators, { category })
}

export function fetchEconomicCorrelation(asset: string) {
  return getJson<EconomicCorrelationDto[]>(economicApiPaths.correlation, { asset })
}

/**
 * 타임라인 마커 — mock↔real 분기의 단일 지점.
 *
 * VITE_USE_MOCK=true  → in-frontend mock(getMockTimelineMarkers)
 * VITE_USE_MOCK=false → GET /economic/calendar 호출 후 mapper로 TimelineMarker 변환
 *
 * 컴포넌트/페이지는 이 함수(또는 useEconomicQueries)만 호출하고 분기를 알 필요가 없다.
 */
export async function loadTimelineMarkers(range: {
  fromTs: number
  toTs: number
}): Promise<TimelineMarker[]> {
  if (env.useMock) {
    return getMockTimelineMarkers()
  }
  const dtos = await fetchEconomicCalendar(range.fromTs, range.toTs)
  return mapCalendarToMarkers(dtos)
}
