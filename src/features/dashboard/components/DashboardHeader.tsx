import type { View } from '../../../app/router'

export function DashboardHeader({
  activeView,
  onNavigate,
}: {
  activeView: View
  onNavigate: (view: View) => void
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Kimchi premium monitor</p>
        <button className="brand-button" type="button" onClick={() => onNavigate('dashboard')}>
          CoinData
        </button>
      </div>
      <nav className="nav-actions" aria-label="Primary navigation">
        <button className={activeView === 'dashboard' ? 'active' : ''} type="button" onClick={() => onNavigate('dashboard')}>
          Dashboard
        </button>
        <button className={activeView === 'detail' ? 'active' : ''} type="button" onClick={() => onNavigate('detail')}>
          Market detail
        </button>
        <button className={activeView === 'timeline' ? 'active' : ''} type="button" onClick={() => onNavigate('timeline')}>
          Timeline
        </button>
      </nav>
    </header>
  )
}
