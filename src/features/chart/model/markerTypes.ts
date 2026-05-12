export type TimelineMarkerType =
  | 'ECONOMIC'
  | 'NEWS'
  | 'EXCHANGE'
  | 'REGULATION'
  | 'SYSTEM'

export interface TimelineMarker {
  id: string
  timestamp: number
  type: TimelineMarkerType
  title: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  source?: string
  url?: string
}
