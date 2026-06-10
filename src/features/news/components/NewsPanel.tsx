import { useEffect, useState } from 'react'
import { getMockNewsTimeline } from '../api/newsApi'
import { toNewsItemView, type NewsItemView } from '../model/newsViewTypes'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return `${Math.floor(diff / 86_400_000)}일 전`
}

const SEVERITY_DOT: Record<NewsItemView['severity'], string> = {
  info: 'news-dot-info',
  warn: 'news-dot-warn',
  critical: 'news-dot-critical',
}

export function NewsPanel() {
  const [items, setItems] = useState<NewsItemView[] | null>(null)

  // NOTE: 화면 컴포넌트에서 fetch 직접 호출 금지. api 레이어의 mock을 통해 로드.
  useEffect(() => {
    const dtos = getMockNewsTimeline()
    const views = dtos
      .map(toNewsItemView)
      .sort((a, b) => b.publishedAt - a.publishedAt)
    setItems(views)
  }, [])

  if (items === null) {
    return <div className="news-empty">불러오는 중…</div>
  }

  if (items.length === 0) {
    return <div className="news-empty">표시할 뉴스가 없습니다.</div>
  }

  return (
    <div className="news-panel">
      <div className="news-list">
        {items.map((n) => (
          <article key={n.id} className="news-row">
            <span className={`news-dot ${SEVERITY_DOT[n.severity]}`} aria-hidden="true" />
            <span className="news-info">
              <strong>{n.title}</strong>
              <small>
                <span className="news-source">{n.source}</span>
                <span className="news-divider" aria-hidden="true">·</span>
                <span className="news-time">{timeAgo(n.publishedAt)}</span>
              </small>
            </span>
          </article>
        ))}
      </div>
    </div>
  )
}
