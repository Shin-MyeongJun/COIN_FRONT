export function ChartToolbar() {
  return (
    <select className="timeframe-select" defaultValue="1h" aria-label="Chart timeframe">
      <option>15m</option>
      <option>1h</option>
      <option>4h</option>
      <option>1d</option>
    </select>
  )
}
