import { useEffect, useState } from 'react'
import { useStreamStore } from '../../stream/model/streamStore'
import type { StreamStatus } from '../../stream/model/streamTypes'

/** Connected but no event for this long → show as stale (데이터 지연). */
const STALE_MS = 20_000

const LABELS: Record<StreamStatus, string> = {
  connected: 'SSE 연결됨',
  reconnecting: '재연결 중…',
  disconnected: '연결 끊김',
  stale: '데이터 지연',
}

const TITLES: Record<StreamStatus, string> = {
  connected: '실시간 스트림 연결됨',
  reconnecting: '스트림 재연결을 시도하는 중',
  disconnected: '스트림 연결이 끊어졌습니다',
  stale: '연결됐지만 최근 데이터가 없습니다',
}

const VARIANT: Record<StreamStatus, string> = {
  connected: '',
  reconnecting: ' stream-pill--warn',
  disconnected: ' stream-pill--error',
  stale: ' stream-pill--warn',
}

export function StreamStatusPill() {
  const status = useStreamStore((s) => s.status)
  const lastEventAt = useStreamStore((s) => s.lastEventAt)

  // Re-evaluate staleness on a slow tick while connected.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (status !== 'connected') return
    const id = setInterval(() => setNow(Date.now()), 5_000)
    return () => clearInterval(id)
  }, [status])

  const isStale =
    status === 'connected' && lastEventAt !== undefined && now - lastEventAt > STALE_MS
  const effective: StreamStatus = isStale ? 'stale' : status

  return (
    <div className={`stream-pill${VARIANT[effective]}`} title={TITLES[effective]}>
      <span className="stream-dot" />
      {LABELS[effective]}
    </div>
  )
}
