export function ChartToolbar() {
  return (
    <select className="timeframe-select" defaultValue="1h" aria-label="차트 시간 단위">
      <option value="15m">15분</option>
      <option value="1h">1시간</option>
      <option value="4h">4시간</option>
      <option value="1d">1일</option>
    </select>
  )
}
