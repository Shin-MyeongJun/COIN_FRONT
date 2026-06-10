import { create } from 'zustand'
import type { StreamStatus } from './streamTypes'

/**
 * Global connection state for the live data streams, surfaced by the
 * StreamStatusPill. Feature live-data hooks (usePremiumLive, useLiveCandle)
 * report their transport status here via `setStatus` / `markEvent`.
 *
 * `stale` is a derived UI state (connected but no event for a while) computed
 * by consumers from `lastEventAt`, not stored as a transport status.
 */
type StreamStore = {
  status: StreamStatus
  lastEventAt?: number
  /** Record a received event: marks the stream connected and stamps the time. */
  markEvent: () => void
  setStatus: (status: StreamStatus) => void
}

export const useStreamStore = create<StreamStore>((set) => ({
  status: 'disconnected',
  lastEventAt: undefined,
  markEvent: () => set({ status: 'connected', lastEventAt: Date.now() }),
  setStatus: (status) => set({ status }),
}))
