import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DashboardHeader } from '../../features/dashboard/components/DashboardHeader'
import { GlobalIndicatorBar } from '../../features/globalBar/components/GlobalIndicatorBar'
import { getMockPremiumPairs } from '../../features/premium/api/premiumApi'
import { useAuthStore } from '../../shared/store/authStore'

const premiumPairs = getMockPremiumPairs()

const SIDEBAR_ITEMS = [
  { label: '개요', path: '/' },
  { label: '프리미엄 순위', path: '/' },
  { label: '마켓 리스트', path: '/market' },
  { label: '경제지표', path: '/economic' },
  { label: '관심 목록', path: '/watchlist' },
  { label: '알람 설정', path: '/alerts' },
  { label: 'API 키', path: '/api-keys' },
  { label: 'API 문서', path: '/api-docs' },
  { label: '설정', path: '/settings' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()

  const averageBuyPremium = useMemo(
    () => premiumPairs.reduce((sum, p) => sum + p.buyPremiumRate, 0) / premiumPairs.length,
    [],
  )
  const totalVolume = useMemo(() => premiumPairs.reduce((sum, p) => sum + p.volume24h, 0), [])

  return (
    <div className="app-shell">
      <DashboardHeader
        averageBuyPremium={averageBuyPremium}
        selectedPair={premiumPairs[0]}
        totalVolume={totalVolume}
      />
      <GlobalIndicatorBar />

      <div className="app-body">
        <aside className="sidebar" aria-label="대시보드 사이드 메뉴">
          <nav className="sidebar-nav">
            {SIDEBAR_ITEMS.map((item) => {
              const active =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)

              return (
                <button
                  key={`${item.label}-${item.path}`}
                  className={active ? 'active' : ''}
                  type="button"
                  onClick={() => navigate(item.path)}
                >
                  <span aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="sidebar-user">
            {isAuthenticated ? (
              <>
                <span className="sidebar-user-name">{user?.name ?? '사용자'}</span>
                <button type="button" className="sidebar-logout" onClick={() => { logout(); navigate('/login') }}>로그아웃</button>
              </>
            ) : (
              <button type="button" className="sidebar-login" onClick={() => navigate('/login')}>로그인</button>
            )}
          </div>

          <div className="sidebar-update">
            <span>데이터 업데이트</span>
            <strong>{new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (KST)</strong>
          </div>
        </aside>

        <section className="app-content" aria-label="주요 콘텐츠">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
