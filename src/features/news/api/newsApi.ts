import type { NewsTimelineDto } from './newsTypes'

export const newsApiPaths = {
  timeline: '/api/v1/news/timeline',
}

export function getMockNewsTimeline(): NewsTimelineDto[] {
  return []
}
