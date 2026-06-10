export type NewsSeverity = 'info' | 'warn' | 'critical'

export interface NewsTimelineDto {
  id: string
  title: string
  source?: string
  url?: string
  publishedAt: number
  severity?: NewsSeverity
}
