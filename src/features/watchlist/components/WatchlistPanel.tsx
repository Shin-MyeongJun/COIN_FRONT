import { useNavigate } from 'react-router-dom'
import { getMockPremiumPairs } from '../../premium/api/premiumApi'
import { PremiumSparkline } from '../../premium/components/PremiumSparkline'
import { formatPercent } from '../../../shared/lib/formatPremium'
import { formatPrice } from '../../../shared/lib/formatPrice'

const SEED_ASSETS = ['BTC', 'ETH', 'XRP', 'SOL']
const allPairs = getMockPremiumPairs()
const seedPairs = SEED_ASSETS.map((asset) => allPairs.find((p) => p.asset === asset)).filter(Boolean)

export function WatchlistPanel() {
  const navigate = useNavigate()

  return (
    <div className="watchlist-panel">
      <div className="panel-list">
        {seedPairs.map((pair) => {
          if (!pair) return null
          return (
            <button
              key={pair.asset}
              className="watchlist-row"
              type="button"
              onClick={() => navigate(`/market/${pair.asset}`)}
            >
              <span className="coin-symbol-badge wl-badge">{pair.asset.slice(0, 1)}</span>
              <span className="wl-info">
                <strong>{pair.asset}</strong>
                <small>{pair.assetName}</small>
              </span>
              <span className="wl-price">
                <strong>{formatPrice(pair.domesticCurrentPrice, 'KRW')}</strong>
                <small className={pair.buyPremiumRate >= 0 ? 'text-positive' : 'text-negative'}>
                  김프 {formatPercent(pair.buyPremiumRate)}
                </small>
              </span>
              <span className="wl-sparkline">
                <PremiumSparkline values={pair.sparkline} />
              </span>
            </button>
          )
        })}
      </div>
      <button className="panel-more-link" type="button" onClick={() => navigate('/watchlist')}>
        관심 목록 관리 →
      </button>
    </div>
  )
}
