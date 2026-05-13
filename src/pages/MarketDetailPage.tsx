import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChartErrorBoundary } from '../features/chart/components/ChartErrorBoundary'
import { IndicatorOverlayControls } from '../features/chart/components/IndicatorOverlayControls'
import { LwCandleChart } from '../features/chart/components/LwCandleChart'
import {
  defaultIndicatorOverlays,
  INTERVALS,
  type IndicatorOverlayState,
  type Interval,
} from '../features/chart/model/chartTypes'
import {
  getMockCandleData,
  getMoreMockCandles,
} from '../features/chart/model/mockCandleData'
import { getMockTimelineMarkers } from '../features/economic/api/economicApi'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'
import { PremiumBreakdownList } from '../features/market/components/PremiumBreakdownList'
import { getMockPremiumPairs } from '../features/premium/api/premiumApi'
import { formatVolume } from '../shared/lib/formatNumber'
import { formatPercent } from '../shared/lib/formatPremium'
import { formatPrice } from '../shared/lib/formatPrice'

const allPairs = getMockPremiumPairs()
const timelineMarkers = getMockTimelineMarkers()

export function MarketDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const [interval, setIntervalKey] = useState<Interval>('1h')
  const [overlays, setOverlays] = useState<IndicatorOverlayState>(defaultIndicatorOverlays)

  const pair = allPairs.find((p) => p.asset === symbol) ?? allPairs[0]

  const [candles, setCandles] = useState(() => getMockCandleData(pair.asset, '1h').candles)
  const [volumes, setVolumes] = useState(() => getMockCandleData(pair.asset, '1h').volumes)

  // Reset candle data when interval changes
  const handleIntervalChange = useCallback((iv: Interval) => {
    setIntervalKey(iv)
    const { candles: c, volumes: v } = getMockCandleData(pair.asset, iv)
    setCandles(c)
    setVolumes(v)
  }, [pair.asset])

  // Infinite scroll: prepend older candles
  const handleNearLeftEdge = useCallback(() => {
    setCandles((prev) => {
      if (!prev.length) return prev
      const oldest = prev[0].time as number
      const { candles: more, volumes: moreVol } = getMoreMockCandles(pair.asset, interval, oldest)
      if (!more.length) return prev
      setVolumes((pv) => [...moreVol, ...pv])
      return [...more, ...prev]
    })
  }, [pair.asset, interval])

  const sparkline = pair.sparkline.length > 0 ? pair.sparkline : [pair.buyPremiumRate]
  const premiumLow = Math.min(...sparkline)
  const premiumHigh = Math.max(...sparkline)
  const premiumRange = premiumHigh - premiumLow || 1
  const rangePosition = Math.min(100, Math.max(0, ((pair.buyPremiumRate - premiumLow) / premiumRange) * 100))
  const impliedFx = pair.domesticCurrentPrice / pair.offshoreCurrentPrice / (1 + pair.buyPremiumRate / 100)

  return (
    <main className="detail-layout coin-detail-page">
      <div style={{ marginBottom: 8 }}>
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
      </div>

      <section className="coin-overview-grid" aria-label="선택 자산 요약">
        <article className="workspace-panel coin-summary-card">
          <div className="coin-title-row">
            <span className="coin-avatar" aria-hidden="true">{pair.asset.slice(0, 1)}</span>
            <div>
              <p className="eyebrow">프리미엄 상세</p>
              <h1>{pair.assetName} {pair.asset}</h1>
              <p>{pair.domesticExchange} 현물과 {pair.offshoreExchange} {pair.offshoreMarketType} 비교</p>
            </div>
            <span className="rank-chip">{pair.futuresExpiry}</span>
          </div>

          <div className="coin-price-stack">
            <span>국내 현재가</span>
            <strong>{formatPrice(pair.domesticCurrentPrice, pair.domesticPriceCurrency)}</strong>
            <small>{pair.domesticExchange} KRW 기준</small>
          </div>

          <div className="price-meta-grid">
            <MiniStat
              label="해외 현재가"
              value={formatPrice(pair.offshoreCurrentPrice, pair.offshorePriceCurrency)}
              caption={`${pair.offshoreExchange} USD 기준`}
            />
            <MiniStat
              label="추정 기준 환율"
              value={`₩${Math.round(impliedFx).toLocaleString('ko-KR')}`}
              caption="매수 프리미엄 역산"
            />
          </div>

          <div className="premium-range-box">
            <div>
              <span>24H 매수 프리미엄 범위</span>
              <strong>{formatPercent(premiumLow)} - {formatPercent(premiumHigh)}</strong>
            </div>
            <div className="range-track" aria-hidden="true">
              <span style={{ width: `${rangePosition}%` }} />
            </div>
          </div>
        </article>

        <article className="workspace-panel coin-market-card">
          <div className="market-card-header">
            <div>
              <p className="eyebrow">시장 요약</p>
              <h2>프리미엄 핵심 지표</h2>
            </div>
            <span className="pair-pill">KRW / USD</span>
          </div>

          <div className="coin-stats-grid">
            <MetricTile label="매수 프리미엄" value={formatPercent(pair.buyPremiumRate)} caption="업비트 매수 기준" tone="positive" />
            <MetricTile label="매도 프리미엄" value={formatPercent(pair.sellPremiumRate)} caption="업비트 매도 기준" tone="positive" />
            <MetricTile label="24H 표준편차" value={`${pair.premiumStdDev24h.toFixed(2)}%`} caption="프리미엄 변동성" tone="warning" />
            <MetricTile label="24H 평균" value={formatPercent(pair.premiumAverage24h)} caption="최근 평균 프리미엄" tone="positive" />
            <MetricTile label="24H 거래량" value={`KRW ${formatVolume(pair.volume24h)}`} caption="국내 기준 환산" />
            <MetricTile
              label="최근 업데이트"
              value={new Date(pair.lastUpdatedAt).toLocaleTimeString('ko-KR')}
              caption="실시간 스트림 기준"
            />
          </div>
        </article>
      </section>

      <section className="workspace-panel coingecko-chart-card" aria-label="캔들 차트">
        <div className="chart-card-top">
          <div>
            <p className="eyebrow">차트</p>
            <h2>{pair.asset} 캔들 차트</h2>
            <p className="live-badge">● LIVE (2초 갱신)</p>
          </div>
          <div className="chart-controls-row">
            <div className="interval-tabs" aria-label="인터벌 선택">
              {INTERVALS.map((iv) => (
                <button
                  key={iv}
                  type="button"
                  className={iv === interval ? 'active' : ''}
                  onClick={() => handleIntervalChange(iv)}
                >
                  {iv}
                </button>
              ))}
            </div>
          </div>
        </div>

        <IndicatorOverlayControls overlays={overlays} onOverlayChange={setOverlays} />

        <ChartErrorBoundary>
          <LwCandleChart
            candles={candles}
            volumes={volumes}
            height={440}
            overlays={overlays}
            enableLiveUpdate
            onNearLeftEdge={handleNearLeftEdge}
          />
        </ChartErrorBoundary>
      </section>

      <section className="coin-lower-grid">
        <article className="workspace-panel statistics-card">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">통계</p>
              <h2>프리미엄 기준값</h2>
            </div>
          </div>
          <PremiumBreakdownList pair={pair} />
        </article>

        <article className="workspace-panel timeline-card">
          <EconomicTimeline markers={timelineMarkers} />
        </article>
      </section>
    </main>
  )
}

function MiniStat({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  )
}

function MetricTile({
  label,
  value,
  caption,
  tone,
}: {
  label: string
  value: string
  caption: string
  tone?: 'positive' | 'negative' | 'warning'
}) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong className={tone ? `text-${tone}` : undefined}>{value}</strong>
      <small>{caption}</small>
    </div>
  )
}
