import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle'

// NOTE: 주 내비게이션은 사이드바(AppLayout)로 단일화. 상단은 브랜드/검색/테마/프로필만 남김.
//       ticker-strip(평균 김프 등)은 GlobalIndicatorBar와 중복되어 제거됨 — 헤더라인은 GlobalIndicatorBar 단일 소스.
export function DashboardHeader() {
  const navigate = useNavigate()

  return (
    <header className="topbar">
      <div className="topbar-main">
        <button className="brand-button" type="button" onClick={() => navigate('/')} aria-label="CoinData 홈">
          <span className="brand-mark" aria-hidden="true" />
          CoinData
        </button>

        <label className="global-search">
          <span className="visually-hidden">코인 검색</span>
          <input type="search" placeholder="코인 검색 (예: BTC, 이더리움)" />
          <kbd>/</kbd>
        </label>

        <div className="header-actions">
          <ThemeToggle />
          <select defaultValue="KRW" aria-label="통화 선택">
            <option value="KRW">KRW</option>
            <option value="USD">USD</option>
          </select>
          <button type="button">알림</button>
          <button className="profile-button" type="button" aria-label="사용자 메뉴">U</button>
        </div>
      </div>
    </header>
  )
}
