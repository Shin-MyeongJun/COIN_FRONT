/**
 * Backend Alert DTO mirror.
 *
 * Endpoints (all JWT-only):
 *   GET    /api/v1/alert/rules               — offset paging
 *   POST   /api/v1/alert/rules               — create
 *   GET    /api/v1/alert/rules/{id}          — read one
 *   PUT    /api/v1/alert/rules/{id}          — replace
 *   DELETE /api/v1/alert/rules/{id}
 *   POST   /api/v1/alert/rules/{id}/enable   — toggle on
 *   POST   /api/v1/alert/rules/{id}/disable  — toggle off
 *   GET    /api/v1/alert/firings             — cursor paging
 *
 * Per backend contract:
 *   - `threshold` is BigDecimal → string (precision-preserving)
 *   - `targetIdentifiers` must have ≥1 entry
 *   - For `targetType:'PREMIUM'`, `metric` is `BUY_PREMIUM_RATE` | `SELL_PREMIUM_RATE`
 */

export type AlertTargetType = 'PREMIUM' | 'TICK' | 'INDICATOR'

export type AlertOperator = '>' | '>=' | '<' | '<=' | '=='

export type AlertChannel = 'SSE' | 'EMAIL' | 'DISCORD'

export type PremiumMetric = 'BUY_PREMIUM_RATE' | 'SELL_PREMIUM_RATE'

/** Metric is target-type-specific; PREMIUM is constrained to PremiumMetric. */
export type AlertMetric = PremiumMetric | string

export type AlertRuleDto = {
  id: number
  userId: number
  label: string
  targetType: AlertTargetType
  /** ≥1 entry. For PREMIUM, asset symbols (['BTC']). */
  targetIdentifiers: string[]
  metric: AlertMetric
  operator: AlertOperator
  /** BigDecimal — keep as string for compare. Number() only for display. */
  threshold: string
  cooldownSec: number
  channels: AlertChannel[]
  active: boolean
  createdAt: number
  updatedAt: number
}

export type CreateAlertRuleRequest = {
  label: string
  targetType: AlertTargetType
  targetIdentifiers: string[]
  metric: AlertMetric
  operator: AlertOperator
  threshold: string
  cooldownSec: number
  channels: AlertChannel[]
  active?: boolean
}

export type UpdateAlertRuleRequest = CreateAlertRuleRequest

export type AlertFiringDto = {
  id: number
  ruleId: number
  ruleLabel: string
  metric: AlertMetric
  threshold: string
  observedValue: string
  firedAt: number
}
