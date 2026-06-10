import type { NewsSeverity, NewsTimelineDto } from '../api/newsTypes'

export interface NewsItemView {
  id: string
  title: string
  source: string
  url?: string
  publishedAt: number
  severity: NewsSeverity
}

export function toNewsItemView(dto: NewsTimelineDto): NewsItemView {
  return {
    id: dto.id,
    title: dto.title,
    source: dto.source ?? '뉴스',
    url: dto.url,
    publishedAt: dto.publishedAt,
    severity: dto.severity ?? 'info',
  }
}
