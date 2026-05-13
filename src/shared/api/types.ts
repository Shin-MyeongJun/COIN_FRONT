export type CursorPage<T> = {
  items: T[]
  nextCursor: number | null
  hasMore: boolean
}

export type OffsetPage<T> = {
  items: T[]
  page: number
  size: number
  total: number
}

export type ProblemDetail = {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
}

export type TickLatestView = {
  marketCodeId: number
  bid: string
  ask: string
  ts: number
}

export type PremiumSnapshot = {
  baseExchangeId: number
  compareExchangeId: number
  symbol: string
  premium: string
  ts: number
}

export type TickCandleView = {
  marketCodeId: number
  interval: string
  bucketOpenTs: number
  open: string
  high: string
  low: string
  close: string
  volume?: string
}

export type SortDirection = 'asc' | 'desc'
