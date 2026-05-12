import type { StreamState } from './streamTypes'

export const initialStreamState: StreamState = {
  status: 'connected',
  lastEventAt: Date.now() - 12_000,
}
