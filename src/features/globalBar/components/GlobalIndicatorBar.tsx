import {
  getMockAveragePremium,
  getMockFearGreed,
  getMockFxRate,
  getMockMetals,
  getMockNasdaq,
  getMockTreasury,
} from '../api/externalMock'

export function GlobalIndicatorBar() {
  return (
    <div className="global-indicator-bar" aria-label="글로벌 시장 지표">
      <FxWidget />
      <PremiumWidget />
      <NasdaqWidget />
      <MetalsWidget />
      <TreasuryWidget />
      <FearGreedWidget />
    </div>
  )
}

function FxWidget() {
  try {
    const data = getMockFxRate()
    const neg = data.change < 0

    return (
      <IndicatorSlot label="USD/KRW">
        <strong>{data.usdKrw.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}</strong>
        <Delta value={data.change} suffix="원" negative={neg} />
      </IndicatorSlot>
    )
  } catch {
    return <IndicatorSlot label="USD/KRW"><span className="indicator-blank">—</span></IndicatorSlot>
  }
}

function PremiumWidget() {
  try {
    const data = getMockAveragePremium()
    const neg = data.change < 0

    return (
      <IndicatorSlot label="평균 김프">
        <strong className={data.rate >= 0 ? 'text-positive' : 'text-negative'}>
          {data.rate >= 0 ? '+' : ''}{data.rate.toFixed(2)}%
        </strong>
        <Delta value={data.change} suffix="%" negative={neg} />
      </IndicatorSlot>
    )
  } catch {
    return <IndicatorSlot label="평균 김프"><span className="indicator-blank">—</span></IndicatorSlot>
  }
}

function NasdaqWidget() {
  try {
    const data = getMockNasdaq()
    const neg = data.change < 0

    return (
      <IndicatorSlot label="나스닥">
        <strong>{data.value.toLocaleString('en-US', { maximumFractionDigits: 1 })}</strong>
        <Delta value={data.changePercent} suffix="%" negative={neg} />
      </IndicatorSlot>
    )
  } catch {
    return <IndicatorSlot label="나스닥"><span className="indicator-blank">—</span></IndicatorSlot>
  }
}

function MetalsWidget() {
  try {
    const data = getMockMetals()

    return (
      <IndicatorSlot label="금 / 은">
        <span className="metals-row">
          <span>
            <small>금</small>
            <strong>${data.gold.toLocaleString('en-US', { maximumFractionDigits: 1 })}</strong>
          </span>
          <span>
            <small>은</small>
            <strong>${data.silver.toFixed(2)}</strong>
          </span>
        </span>
      </IndicatorSlot>
    )
  } catch {
    return <IndicatorSlot label="금 / 은"><span className="indicator-blank">—</span></IndicatorSlot>
  }
}

function TreasuryWidget() {
  try {
    const data = getMockTreasury()
    const neg = data.change < 0

    return (
      <IndicatorSlot label="미 10Y 금리">
        <strong>{data.yield10y.toFixed(2)}%</strong>
        <Delta value={data.change} suffix="bp" factor={100} negative={neg} />
      </IndicatorSlot>
    )
  } catch {
    return <IndicatorSlot label="미 10Y 금리"><span className="indicator-blank">—</span></IndicatorSlot>
  }
}

function FearGreedWidget() {
  try {
    const data = getMockFearGreed()
    const tone = data.value >= 60 ? 'positive' : data.value >= 40 ? '' : 'negative'

    return (
      <IndicatorSlot label="공포·탐욕">
        <strong className={tone ? `text-${tone}` : undefined}>{data.value}</strong>
        <small>{data.label}</small>
      </IndicatorSlot>
    )
  } catch {
    return <IndicatorSlot label="공포·탐욕"><span className="indicator-blank">—</span></IndicatorSlot>
  }
}

function IndicatorSlot({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="indicator-slot">
      <span className="indicator-label">{label}</span>
      <div className="indicator-value">{children}</div>
    </div>
  )
}

function Delta({
  value,
  suffix,
  negative,
  factor = 1,
}: {
  value: number
  suffix: string
  negative: boolean
  factor?: number
}) {
  const display = Math.abs(value * factor).toFixed(2)

  return (
    <small className={negative ? 'text-negative' : 'text-positive'}>
      {negative ? '▼' : '▲'} {display}{suffix}
    </small>
  )
}
