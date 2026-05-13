import type { PremiumPairView } from '../../premium/model/premiumViewTypes'

export function MarketPairHeader({ pair }: { pair: PremiumPairView }) {
  return (
    <div className="market-heading">
      <div>
        <p className="eyebrow">차트 페이지</p>
        <h1>{pair.asset} 프리미엄 차트</h1>
        <p>
          {pair.domesticExchange} 현물과 {pair.offshoreExchange} {pair.offshoreMarketType}
          {` ${pair.futuresExpiry}`} 페어를 비교합니다.
        </p>
      </div>
      <span className="pair-pill">KRW / USD</span>
    </div>
  )
}
