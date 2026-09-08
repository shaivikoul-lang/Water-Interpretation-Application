import type { SourceId } from './sourceRegistry.ts'

/** Official HRW Water Quality Indicators — 2025 finished-water quarterly TDS averages. */
export type HrwTdsQuarter = {
  quarter: 1 | 2 | 3 | 4
  value: number
}

export const HRW_TDS_2025 = {
  parameter: 'TDS',
  unit: 'mg/L',
  year: 2025,
  sourceId: 'hrw_water_quality_indicators' as const satisfies SourceId,
  context:
    'Quarterly averages of finished-water samples reported by Highlands Ranch Water.',
  samples: [
    { quarter: 1, value: 234 },
    { quarter: 2, value: 580 },
    { quarter: 3, value: 397 },
    { quarter: 4, value: 425 },
  ] as const satisfies readonly HrwTdsQuarter[],
} as const

export const EPA_TDS_SMCL_MG_L = 500

export function hrwTdsStats() {
  const values = HRW_TDS_2025.samples.map((s) => s.value)
  const sorted = [...values].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const mean = values.reduce((sum, n) => sum + n, 0) / values.length
  const median = (sorted[1] + sorted[2]) / 2
  const latest = HRW_TDS_2025.samples[HRW_TDS_2025.samples.length - 1]
  return { min, max, mean, median, latest, values }
}
