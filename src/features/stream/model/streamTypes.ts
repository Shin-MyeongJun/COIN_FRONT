export type StreamStatus = 'connected' | 'reconnecting' | 'disconnected' | 'stale'

export interface StreamState {
  status: StreamStatus
  lastEventAt?: number
}
