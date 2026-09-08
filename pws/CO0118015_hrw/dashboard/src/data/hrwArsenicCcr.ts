import type { SourceId } from '../lib/sourceRegistry'

/** Federal arsenic MCL — not JSX. */
export const ARSENIC_REGULATION = {
  mclPpb: 10,
  mclgPpb: 0,
  previousMclPpb: 50,
  ruleAdoptedLabel: 'January 22, 2001',
  complianceDeadlineLabel: 'January 23, 2006',
  currentRuleLabel: 'EPA Maximum Contaminant Level',
  currentRuleName: 'Arsenic Rule',
  unit: 'ppb',
  sourceId: 'epa_arsenic_rule' as SourceId,
} as const

export type HrwArsenicYear = {
  id: string
  year: number
  label: string
  shortLabel: string
  averagePpb: number
  rangeLowPpb: number
  rangeHighPpb: number
  sampleSize: number
  mclViolation: boolean
  unit: 'ppb'
  program: 'hrw_ccr_entry_point'
  sourceId: SourceId
  reportLabel: string
}

export const HRW_ARSENIC_CCR_META = {
  program: 'hrw_ccr_entry_point',
  programLabel: 'Highlands Ranch Water entry-point inorganic monitoring',
  reportLabel: 'Highlands Ranch Water 2026 Water Quality Report (2025 monitoring)',
  sourceId: 'hrw_2026_ccr' as SourceId,
  typicalSources:
    'Erosion of natural deposits; runoff from orchards; runoff from glass and electronics production wastes',
  note: 'These averages come from the Highlands Ranch Water entry-point inorganic table in the official Consumer Confidence Reports. They are not mixed with a different supplier table in the same booklet, and they are not invented values.',
} as const

/** Official HRW entry-point arsenic rows from the 2025 and 2026 Water Quality Reports. */
export const HRW_ARSENIC_CCR_YEARS: readonly HrwArsenicYear[] = [
  {
    id: '2024',
    year: 2024,
    label: '2024 monitoring (2025 Water Quality Report)',
    shortLabel: '2024',
    averagePpb: 1.27,
    rangeLowPpb: 0.6,
    rangeHighPpb: 2.2,
    sampleSize: 3,
    mclViolation: false,
    unit: 'ppb',
    program: 'hrw_ccr_entry_point',
    sourceId: 'hrw_2025_ccr',
    reportLabel: 'Highlands Ranch Water 2025 Water Quality Report',
  },
  {
    id: '2025',
    year: 2025,
    label: '2025 monitoring (2026 Water Quality Report)',
    shortLabel: '2025',
    averagePpb: 0.8,
    rangeLowPpb: 0,
    rangeHighPpb: 1.7,
    sampleSize: 3,
    mclViolation: false,
    unit: 'ppb',
    program: 'hrw_ccr_entry_point',
    sourceId: 'hrw_2026_ccr',
    reportLabel: 'Highlands Ranch Water 2026 Water Quality Report',
  },
] as const

export function mostRecentArsenicYear(): HrwArsenicYear {
  return HRW_ARSENIC_CCR_YEARS[HRW_ARSENIC_CCR_YEARS.length - 1]
}
