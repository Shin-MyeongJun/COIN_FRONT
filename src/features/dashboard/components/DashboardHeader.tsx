import { useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle'

const NAV_ITEMS = [
  { label: '대시보드', path: '/' },
  { label: '마켓', path: '/market' },
  { label: '경제지표', path: '/economic' },
  { label: '관심 목록', path: '/watchlist' },
  { label: '알림', path: '/alerts' },
  { label: 'API 문서', path: '/api-docs' },
]

// NOTE: ticker-strip(평균 김프 등)은 GlobalIndicatorBar와 중복되어 제거. 헤더라인은 GlobalIndicatorBar 단일 소스.
export function DashboardHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="topbar">
      <div className="topbar-main">
        <button className="brand-button" type="button" onClick={() => navigate('/')} aria-label="CoinData 홈">
          <span className="brand-mark" aria-hidden="true" />
          CoinData
        </button>

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

      <div className="topnav-row">
        <nav className="nav-actions" aria-label="주요 화면 이동">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.path}
              active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
              label={item.label}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <label className="global-search">
          <span className="visually-hidden">코인 검색</span>
          <input type="search" placeholder="코인 검색 (예: BTC, 이더리움)" />
          <kbd>/</kbd>
        </label>
      </div>
    </header>
  )
}

function NavButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={active ? 'active' : ''} type="button" onClick={onClick}>
      <span aria-hidden="true" />
      {label}
    </button>
  )
}
