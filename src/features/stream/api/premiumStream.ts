import { createSseClient } from './sseClient'

export const premiumStreamPath = '/api/v1/stream/premium'

export function connectPremiumStream() {
  return createSseClient(premiumStreamPath)
}
