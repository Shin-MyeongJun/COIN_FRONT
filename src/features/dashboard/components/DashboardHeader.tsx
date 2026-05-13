import { useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle'
import { formatVolume } from '../../../shared/lib/formatNumber'
import { formatPercent } from '../../../shared/lib/formatPremium'
import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

const NAV_ITEMS = [
  { label: '대시보드', path: '/' },
  { label: '마켓', path: '/market' },
  { label: '경제지표', path: '/economic' },
  { label: '관심 목록', path: '/watchlist' },
  { label: '알림', path: '/alerts' },
  { label: 'API 문서', path: '/api-docs' },
]

export function DashboardHeader({
  averageBuyPremium,
  selectedPair,
  totalVolume,
}: {
  averageBuyPremium: number
  selectedPair: PremiumPairView
  totalVolume: number
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const impliedFx = selectedPair.domesticCurrentPrice / selectedPair.offshoreCurrentPrice / (1 + selectedPair.buyPremiumRate / 100)

  return (
    <header className="topbar">
      <div className="topbar-main">
        <button className="brand-button" type="button" onClick={() => navigate('/')} aria-label="CoinData 홈">
          <span className="brand-mark" aria-hidden="true" />
          CoinData
        </button>

        <div className="ticker-strip" aria-label="시장 요약">
          <TickerItem label={`${selectedPair.asset} 김프`} value={formatPercent(selectedPair.buyPremiumRate)} tone="positive" />
          <TickerItem label="USDT/KRW" value={impliedFx.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} />
          <TickerItem label="24h Premium Vol" value={`₩${formatVolume(totalVolume)}`} delta={formatPercent(18.7)} tone="positive" />
          <TickerItem label="평균 김프" value={formatPercent(averageBuyPremium)} delta="▼ 0.38%" tone="negative" />
          <TickerItem label="Fear & Greed" value="63 (Greed)" tone="positive" gauge />
        </div>

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

function TickerItem({
  label,
  value,
  delta,
  tone,
  gauge = false,
}: {
  label: string
  value: string
  delta?: string
  tone?: 'positive' | 'negative'
  gauge?: boolean
}) {
  return (
    <div className="ticker-item">
      <span>{label}</span>
      <strong className={tone ? `text-${tone}` : undefined}>{value}</strong>
      {delta && <small className={tone ? `text-${tone}` : undefined}>{delta}</small>}
      {gauge && <i aria-hidden="true" />}
    </div>
  )
}
