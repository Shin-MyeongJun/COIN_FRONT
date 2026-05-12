import { createSseClient } from './sseClient'

export const indicatorCloseStreamPath = '/api/v1/stream/indicators/close'

export function connectIndicatorCloseStream(type = 'tick') {
  return createSseClient(indicatorCloseStreamPath, { type })
}
