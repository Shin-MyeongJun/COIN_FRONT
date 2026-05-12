import { createSseClient } from './sseClient'

export const tickStreamPath = '/api/v1/stream/ticks'

export function connectTickStream(marketCodeId?: number) {
  return createSseClient(tickStreamPath, { marketCodeId })
}
