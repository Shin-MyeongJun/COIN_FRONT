export const queryKeys = {
  dashboard: (marketCodeIds: number[]) => ['dashboard', marketCodeIds.join(',')] as const,
  premiumRanking: (limit: number) => ['premium', 'ranking', limit] as const,
  premiumSeries: (symbol: string) => ['premium', 'series', symbol] as const,
  chart: (marketCodeId: number, interval: string) => ['chart', marketCodeId, interval] as const,
  economicCalendar: (fromTs: number, toTs: number) => ['economic', 'calendar', fromTs, toTs] as const,
}
