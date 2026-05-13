export type NasdaqData = { value: number; change: number; changePercent: number }
export type MetalData = { gold: number; silver: number; goldChange: number; silverChange: number }
export type TreasuryData = { yield10y: number; change: number }
export type FearGreedData = { value: number; label: string }
export type FxData = { usdKrw: number; change: number }

export function getMockNasdaq(): NasdaqData {
  return { value: 19_234.5, change: 142.3, changePercent: 0.75 }
}

export function getMockMetals(): MetalData {
  return { gold: 3_248.4, silver: 32.85, goldChange: 0.42, silverChange: -0.18 }
}

export function getMockTreasury(): TreasuryData {
  return { yield10y: 4.28, change: -0.03 }
}

export function getMockFearGreed(): FearGreedData {
  return { value: 63, label: 'Greed' }
}

export function getMockFxRate(): FxData {
  return { usdKrw: 1_382.5, change: -3.2 }
}

export function getMockAveragePremium(): { rate: number; change: number } {
  return { rate: 3.87, change: -0.12 }
}
