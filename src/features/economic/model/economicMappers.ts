/**
 * EconomicCalendarDto → TimelineMarker(chart/model/markerTypes) 변환.
 *
 * 백엔드 DTO를 화면(EconomicTimeline)에 직접 쓰지 않기 위한 mapper.
 * 공통 shape(TimelineMarker)을 유지해 chart 오버레이/타임라인 패널이 동일 타입을 소비한다.
 */

import type { TimelineMarker, TimelineMarkerType } from '../../chart/model/markerTypes'
import type { EconomicCalendarDto } from '../api/economicTypes'

type Severity = TimelineMarker['severity']

/**
 * severity 정규화 규칙 (대소문자 무시):
 *   HIGH   ← 'high' | 'critical' | 'severe' | '3'
 *   MEDIUM ← 'medium' | 'warn' | 'warning' | '2'
 *   LOW    ← 'low' | 'info' | '1'
 *   그 외/누락 → MEDIUM (보수적 기본값)
 */
function mapSeverity(raw: string | undefined): Severity {
  switch ((raw ?? '').trim().toLowerCase()) {
    case 'high':
    case 'critical':
    case 'severe':
    case '3':
      return 'HIGH'
    case 'low':
    case 'info':
    case '1':
      return 'LOW'
    case 'medium':
    case 'warn':
    case 'warning':
    case '2':
      return 'MEDIUM'
    default:
      return 'MEDIUM'
  }
}

/**
 * category → TimelineMarkerType 매핑.
 * calendar 이벤트 기본은 ECONOMIC. 백엔드가 category를 주면 분기한다.
 */
function mapType(category: string | undefined): TimelineMarkerType {
  switch ((category ?? '').trim().toLowerCase()) {
    case 'exchange':
      return 'EXCHANGE'
    case 'news':
      return 'NEWS'
    case 'regulation':
    case 'policy':
      return 'REGULATION'
    case 'system':
      return 'SYSTEM'
    default:
      return 'ECONOMIC'
  }
}

/** eventTs 없는 행은 타임라인에 올릴 수 없으므로 null 반환 후 상위에서 필터. */
export function mapCalendarDtoToMarker(dto: EconomicCalendarDto): TimelineMarker | null {
  if (typeof dto.eventTs !== 'number') return null

  const id = dto.code ?? (typeof dto.id === 'number' ? String(dto.id) : undefined)
  if (id === undefined) return null

  return {
    id,
    timestamp: dto.eventTs,
    type: mapType(dto.category),
    title: dto.title ?? '제목 미상 이벤트',
    severity: mapSeverity(dto.severity),
    source: dto.source ?? '경제 캘린더',
  }
}

/** DTO 배열 → TimelineMarker 배열 (유효하지 않은 행 제거, 최신순 정렬). */
export function mapCalendarToMarkers(dtos: EconomicCalendarDto[]): TimelineMarker[] {
  return dtos
    .map(mapCalendarDtoToMarker)
    .filter((m): m is TimelineMarker => m !== null)
    .sort((a, b) => b.timestamp - a.timestamp)
}
