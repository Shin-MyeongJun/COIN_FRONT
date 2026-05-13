import type { ChangeEvent } from 'react'
import type { PremiumFilterOptions, PremiumFilters } from '../model/premiumFilters'

export function PremiumFilterBar({
  filters,
  options,
  onFilterChange,
}: {
  filters: PremiumFilters
  options: PremiumFilterOptions
  onFilterChange: <K extends keyof PremiumFilters>(key: K, value: PremiumFilters[K]) => void
}) {
  function onTextInput(key: keyof PremiumFilters) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      onFilterChange(key, event.target.value as never)
    }
  }

  function onSelectInput(key: keyof PremiumFilters) {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      onFilterChange(key, event.target.value as never)
    }
  }

  return (
    <form className="filter-bar" onSubmit={(event) => event.preventDefault()}>
      <label className="field wide">
        <span>코인명</span>
        <input
          type="search"
          value={filters.keyword}
          onChange={onTextInput('keyword')}
          placeholder="BTC, 비트코인, XRP"
        />
      </label>
      <label className="field">
        <span>국내 거래소</span>
        <select value={filters.domesticExchange} onChange={onSelectInput('domesticExchange')}>
          {options.domesticExchanges.map((exchange) => (
            <option key={exchange}>{exchange}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>해외 페어</span>
        <select value={filters.offshoreExchange} onChange={onSelectInput('offshoreExchange')}>
          {options.offshoreExchanges.map((exchange) => (
            <option key={exchange}>{exchange}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>선물 기한</span>
        <select value={filters.futuresExpiry} onChange={onSelectInput('futuresExpiry')}>
          {options.futuresExpiries.map((expiry) => (
            <option key={expiry}>{expiry}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>매수 이상</span>
        <input
          type="number"
          step="0.1"
          value={filters.minBuyPremiumRate}
          onChange={onTextInput('minBuyPremiumRate')}
          placeholder="3.0"
        />
      </label>
      <label className="field">
        <span>매수 이하</span>
        <input
          type="number"
          step="0.1"
          value={filters.maxBuyPremiumRate}
          onChange={onTextInput('maxBuyPremiumRate')}
          placeholder="5.0"
        />
      </label>
      <label className="field">
        <span>표준편차 이상</span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={filters.minPremiumStdDev24h}
          onChange={onTextInput('minPremiumStdDev24h')}
          placeholder="0.5"
        />
      </label>
      <label className="field">
        <span>거래량 이상(B)</span>
        <input
          type="number"
          min="0"
          step="10"
          value={filters.minVolume24h}
          onChange={onTextInput('minVolume24h')}
          placeholder="100"
        />
      </label>
    </form>
  )
}
