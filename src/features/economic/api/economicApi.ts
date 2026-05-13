import { getJson } from '../../../shared/api/httpClient'
import type { TimelineMarker } from '../../chart/model/markerTypes'
import type { EconomicCalendarDto } from './economicTypes'

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
