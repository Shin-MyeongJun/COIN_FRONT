/**
 * Alert rule form schema + DTO ↔ form mappers.
 *
 * The schema mirrors backend validation:
 *   - label                : 1..50 chars
 *   - targetIdentifiers    : ≥1 entry
 *   - threshold            : non-empty, finite number (kept as BigDecimal string)
 *   - cooldownSec          : 10s..24h
 *   - channels             : ≥1 entry
 *   - When targetType='PREMIUM', metric ∈ {BUY_PREMIUM_RATE, SELL_PREMIUM_RATE}
 *
 * If the backend rejects something we did not catch here, the mutation throws
 * an ApiError and the page surfaces it via <ProblemDetailAlert>.
 */

import { z } from 'zod'
import type {
  AlertChannel,
  AlertOperator,
  AlertRuleDto,
  AlertTargetType,
  CreateAlertRuleRequest,
  PremiumMetric,
} from '../api/alertTypes'

export const TARGET_TYPES = ['PREMIUM', 'TICK', 'INDICATOR'] as const
export const OPERATORS = ['>', '>=', '<', '<=', '=='] as const
export const CHANNELS = ['SSE', 'EMAIL', 'DISCORD'] as const
export const PREMIUM_METRICS = ['BUY_PREMIUM_RATE', 'SELL_PREMIUM_RATE'] as const

/** Candidate identifiers shown in the picker. Catalog is M3-mocked elsewhere. */
export const ASSET_CANDIDATES = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA', 'AVAX'] as const

export const alertRuleSchema = z
  .object({
    label: z.string().min(1, '라벨을 입력하세요').max(50, '최대 50자'),
    targetType: z.enum(TARGET_TYPES),
    targetIdentifiers: z
      .array(z.string().min(1))
      .min(1, '대상을 최소 1개 선택하세요'),
    metric: z.string().min(1, '지표를 선택하세요'),
    operator: z.enum(OPERATORS),
    threshold: z
      .string()
      .min(1, '임계값을 입력하세요')
      .refine((v) => Number.isFinite(Number.parseFloat(v)), '숫자를 입력하세요'),
    cooldownSec: z
      .number({ message: '쿨다운을 입력하세요' })
      .int('정수만 가능합니다')
      .min(10, '최소 10초')
      .max(86_400, '최대 24시간'),
    channels: z.array(z.enum(CHANNELS)).min(1, '채널을 최소 1개 선택하세요'),
    active: z.boolean(),
  })
  .refine(
    (v) =>
      v.targetType !== 'PREMIUM' ||
      (PREMIUM_METRICS as readonly string[]).includes(v.metric),
    {
      message: 'PREMIUM 대상은 BUY_PREMIUM_RATE / SELL_PREMIUM_RATE 중 하나여야 합니다',
      path: ['metric'],
    },
  )

export type AlertRuleFormValues = z.infer<typeof alertRuleSchema>

export function defaultAlertRuleFormValues(): AlertRuleFormValues {
  return {
    label: '',
    targetType: 'PREMIUM',
    targetIdentifiers: ['BTC'],
    metric: 'BUY_PREMIUM_RATE',
    operator: '>',
    threshold: '5',
    cooldownSec: 60,
    channels: ['SSE'],
    active: true,
  }
}

export function ruleToFormValues(rule: AlertRuleDto): AlertRuleFormValues {
  return {
    label: rule.label,
    targetType: rule.targetType,
    targetIdentifiers: rule.targetIdentifiers,
    metric: rule.metric,
    operator: rule.operator,
    threshold: rule.threshold,
    cooldownSec: rule.cooldownSec,
    channels: rule.channels,
    active: rule.active,
  }
}

export function formValuesToCreateRequest(
  form: AlertRuleFormValues,
): CreateAlertRuleRequest {
  return {
    label: form.label,
    targetType: form.targetType as AlertTargetType,
    targetIdentifiers: form.targetIdentifiers,
    metric:
      form.targetType === 'PREMIUM'
        ? (form.metric as PremiumMetric)
        : form.metric,
    operator: form.operator as AlertOperator,
    threshold: form.threshold,
    cooldownSec: form.cooldownSec,
    channels: form.channels as AlertChannel[],
    active: form.active,
  }
}
