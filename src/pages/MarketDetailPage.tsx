import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChartErrorBoundary } from '../features/chart/components/ChartErrorBoundary'
import { IndicatorOverlayControls } from '../features/chart/components/IndicatorOverlayControls'
import { LwCandleChart } from '../features/chart/components/LwCandleChart'
import { useLiveCandle } from '../features/chart/model/useLiveCandle'
import {
  defaultIndicatorOverlays,
  INTERVALS,
  type IndicatorOverlayState,
  type Interval,
} from '../features/chart/model/chartTypes'
import { useChartComposition } from '../features/market/api/useMarketQueries'
import { useTimelineMarkers } from '../features/economic/api/useEconomicQueries'
import { EconomicTimeline } from '../features/economic/components/EconomicTimeline'
import { PremiumBreakdownList } from '../features/market/components/PremiumBreakdownList'
import { getMockPremiumPairs } from '../features/premium/api/premiumApi'
import { env } from '../shared/config/env'
import { formatVolume } from '../shared/lib/formatNumber'
import { formatPercent } from '../shared/lib/formatPremium'
import { formatPrice } from '../shared/lib/formatPrice'

const allPairs = getMockPremiumPairs()

export function MarketDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const [interval, setIntervalKey] = useState<Interval>('1h')
  const [overlays, setOverlays] = useState<IndicatorOverlayState>(defaultIndicatorOverlays)
  const { data: timelineMarkers } = useTimelineMarkers()

  const pairIndex = allPairs.findIndex((p) => p.asset === symbol)
  const pair = pairIndex >= 0 ? allPairs[pairIndex] : allPairs[0]
  // mock 모드에는 실제 marketCodeId 가 없어 자산 인덱스를 stand-in 으로 사용한다.
  // real 모드에서는 meta 조회로 받은 marketCodeId 로 대체될 자리(후속 PR).
  const marketCodeId = (pairIndex >= 0 ? pairIndex : 0) + 1

  // 캔들/볼륨/EMA = 백엔드 composition. interval 이 캐시 키라 전환 시 자동 재조회된다.
  const chartQuery = useChartComposition({ marketCodeId, interval, asset: pair.asset })
  const candles = chartQuery.data?.candles ?? []
  const volumes = chartQuery.data?.volumes ?? []
  const chartIndicators = chartQuery.data
    ? { ema20: chartQuery.data.ema20, ema50: chartQuery.data.ema50 }
    : undefined

  // 라이브 캔들: mock 모드면 2초 시뮬레이션, real 모드면 candles/close SSE 구독.
  const liveCandle = useLiveCandle({ asset: pair.asset, candles })

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
            <p className="live-badge">● LIVE {env.useMock ? '(2초 시뮬레이션)' : '(실시간 SSE)'}</p>
          </div>
          <div className="chart-controls-row">
            <div className="interval-tabs" aria-label="인터벌 선택">
              {INTERVALS.map((iv) => (
                <button
                  key={iv}
                  type="button"
                  className={iv === interval ? 'active' : ''}
                  onClick={() => setIntervalKey(iv)}
                >
                  {iv}
                </button>
              ))}
            </div>
          </div>
        </div>

        <IndicatorOverlayControls overlays={overlays} onOverlayChange={setOverlays} />

        <ChartErrorBoundary>
          {chartQuery.isError ? (
            <p className="chart-empty" role="alert">
              차트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : candles.length === 0 ? (
            <p className="chart-empty" role="status">
              {chartQuery.isLoading ? '차트를 불러오는 중…' : '표시할 캔들 데이터가 없습니다.'}
            </p>
          ) : (
            <LwCandleChart
              candles={candles}
              volumes={volumes}
              height={440}
              overlays={overlays}
              indicators={chartIndicators}
              liveCandle={liveCandle}
            />
          )}
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
          <EconomicTimeline markers={timelineMarkers ?? []} />
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
