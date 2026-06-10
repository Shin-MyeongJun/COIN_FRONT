import type { NewsTimelineDto } from './newsTypes'

export const newsApiPaths = {
  timeline: '/api/v1/news/timeline',
}

// NOTE: 백엔드 미연결 상태. 실호출 전환 시 동일 시그니처 유지.
export function getMockNewsTimeline(): NewsTimelineDto[] {
  const now = Date.now()
  return [
    {
      id: 'n-001',
      title: 'FOMC 의사록 공개 — 다수 위원, 추가 인하에 신중',
      source: 'Reuters',
      publishedAt: now - 6 * 60_000,
      severity: 'warn',
    },
    {
      id: 'n-002',
      title: '비트코인 ETF 일일 순유입 4억 달러 — 7거래일 연속',
      source: 'CoinDesk',
      publishedAt: now - 28 * 60_000,
      severity: 'info',
    },
    {
      id: 'n-003',
      title: '업비트, 신규 상장 코인 입출금 일시 중단 공지',
      source: '업비트',
      publishedAt: now - 75 * 60_000,
      severity: 'critical',
    },
    {
      id: 'n-004',
      title: '이더리움 차기 하드포크 일정 확정, 검증인 노드 업데이트 권고',
      source: 'The Block',
      publishedAt: now - 3 * 3_600_000,
      severity: 'info',
    },
    {
      id: 'n-005',
      title: '한국은행 외환보유액 발표 — 전월 대비 소폭 감소',
      source: '연합뉴스',
      publishedAt: now - 6 * 3_600_000,
      severity: 'info',
    },
  ]
}
