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
      title: 'US CPI release lifted dollar volatility',
      severity: 'HIGH',
      source: 'Economic calendar',
    },
    {
      id: 'fomc',
      timestamp: now - 3_240_000,
      type: 'ECONOMIC',
      title: 'FOMC minutes scheduled near US close',
      severity: 'MEDIUM',
      source: 'Fed calendar',
    },
    {
      id: 'exchange',
      timestamp: now - 1_560_000,
      type: 'EXCHANGE',
      title: 'Binance order book spread widened on BTC/KRW proxy pair',
      severity: 'MEDIUM',
      source: 'Stream monitor',
    },
    {
      id: 'news',
      timestamp: now - 960_000,
      type: 'NEWS',
      title: 'ETF flow headline coincided with premium expansion',
      severity: 'LOW',
      source: 'News timeline',
    },
  ]
}

export function fetchEconomicCalendar(fromTs: number, toTs: number) {
  return getJson<EconomicCalendarDto[]>(economicApiPaths.calendar, { fromTs, toTs })
}
