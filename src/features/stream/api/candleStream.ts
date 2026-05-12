import { createSseClient } from './sseClient'

export const candleCloseStreamPath = '/api/v1/stream/candles/close'

export function connectCandleCloseStream(type = 'tick') {
  return createSseClient(candleCloseStreamPath, { type })
}
