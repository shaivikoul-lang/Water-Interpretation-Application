import type { SourceId } from '../lib/sourceRegistry'

/** EPA screening values — not an MCL. */
export const LITHIUM_REGULATION = {
  hasMcl: false,
  hrlPpb: 10,
  mrlPpb: 9,
  usgsAltScreenPpb: 60,
  currentRuleLabel: 'EPA Health Reference Level',
  currentRuleName: 'CCL 5 screening HRL',
  unit: 'ppb',
  sourceId: 'epa_lithium_factsheet' as SourceId,
} as const

export type HrwLithiumYear = {
  id: string
  year: number
  label: string
  shortLabel: string
  averagePpb: number
  rangeLowLabel: string
  rangeHighPpb: number
  sampleSize: number
  unit: 'ppb'
  program: 'hrw_ucmr5_entry_point'
  sourceId: SourceId
  reportLabel: string
}

export const HRW_LITHIUM_UCMR_META = {
  program: 'hrw_ucmr5_entry_point',
  programLabel: 'Highlands Ranch Water UCMR 5 entry-point monitoring',
  reportLabel: 'Highlands Ranch Water 2025 Water Quality Report (UCMR 5)',
  sourceId: 'hrw_2025_ccr' as SourceId,
} as const

/** Official HRW UCMR 5 lithium row. The 2026 report reprints UCMR language but does not replace this HRW result. */
export const HRW_LITHIUM_UCMR_YEARS: readonly HrwLithiumYear[] = [
  {
    id: '2024',
    year: 2024,
    label: '2024 UCMR 5 monitoring (2025 Water Quality Report)',
    shortLabel: '2024',
    averagePpb: 21.7,
    rangeLowLabel: 'BRL',
    rangeHighPpb: 35.2,
    sampleSize: 7,
    unit: 'ppb',
    program: 'hrw_ucmr5_entry_point',
    sourceId: 'hrw_2025_ccr',
    reportLabel: 'Highlands Ranch Water 2025 Water Quality Report',
  },
] as const

export function mostRecentLithiumYear(): HrwLithiumYear {
  return HRW_LITHIUM_UCMR_YEARS[HRW_LITHIUM_UCMR_YEARS.length - 1]
}
