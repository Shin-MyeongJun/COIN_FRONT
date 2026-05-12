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
        <span>Search</span>
        <input
          type="search"
          value={filters.keyword}
          onChange={onTextInput('keyword')}
          placeholder="BTC, Ethereum, XRP"
        />
      </label>
      <label className="field">
        <span>Domestic</span>
        <select value={filters.domesticExchange} onChange={onSelectInput('domesticExchange')}>
          {options.domesticExchanges.map((exchange) => (
            <option key={exchange}>{exchange}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Offshore</span>
        <select value={filters.offshoreExchange} onChange={onSelectInput('offshoreExchange')}>
          {options.offshoreExchanges.map((exchange) => (
            <option key={exchange}>{exchange}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Quote</span>
        <select value={filters.quoteCurrency} onChange={onSelectInput('quoteCurrency')}>
          {options.quoteCurrencies.map((currency) => (
            <option key={currency}>{currency}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Min buy %</span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={filters.minBuyPremiumRate}
          onChange={onTextInput('minBuyPremiumRate')}
          placeholder="3.5"
        />
      </label>
      <label className="field">
        <span>Min sell %</span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={filters.minSellPremiumRate}
          onChange={onTextInput('minSellPremiumRate')}
          placeholder="3.0"
        />
      </label>
      <label className="field">
        <span>Min vol B</span>
        <input
          type="number"
          min="0"
          step="10"
          value={filters.minVolume}
          onChange={onTextInput('minVolume')}
          placeholder="100"
        />
      </label>
      <label className="field">
        <span>Fresh s</span>
        <input
          type="number"
          min="0"
          step="30"
          value={filters.freshnessSeconds}
          onChange={onTextInput('freshnessSeconds')}
        />
      </label>
      <label className="toggle-field">
        <input
          type="checkbox"
          checked={filters.elevatedOnly}
          onChange={(event) => onFilterChange('elevatedOnly', event.target.checked)}
        />
        <span>Elevated only</span>
      </label>
    </form>
  )
}
