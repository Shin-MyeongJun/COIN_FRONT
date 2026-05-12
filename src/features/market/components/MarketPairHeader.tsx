import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

export function MarketPairHeader({ pair }: { pair: PremiumPairView }) {
  return (
    <div className="market-heading">
      <div>
        <p className="eyebrow">Market detail</p>
        <h1>{pair.asset}/KRW premium detail</h1>
        <p>{pair.domesticExchange} order book compared with {pair.offshoreExchange} liquidity.</p>
      </div>
      <span className="pair-pill">{pair.quoteCurrency}</span>
    </div>
  )
}
