import type { SourceId } from '../lib/sourceRegistry'

export const COPPER_REGULATION = {
  currentActionLevelPpm: 1.3,
  currentMclgPpm: 1.3,
  currentRuleLabel: 'EPA Copper Action Level',
  currentRuleName: 'Lead and Copper Rule',
  unit: 'ppm',
  sourceId: 'epa_lcri' as SourceId,
} as const

export type HrwCopperPeriod = {
  id: string
  startIso: string
  endIso: string
  label: string
  shortLabel: string
  year: number
  percentile90Ppm: number
  sampleSize: number
  sitesAboveActionLevel: number
  tapRangeLowPpm: number
  tapRangeHighPpm: number
  actionLevelExceedance: boolean
  unit: 'ppm'
  program: 'hrw_lcr_tap_sampling'
  sourceId: SourceId
  reportLabel: string
}

export const HRW_COPPER_LCR_META = {
  program: 'hrw_lcr_tap_sampling',
  programLabel: 'Highlands Ranch Water Lead and Copper Rule tap sampling',
  reportLabel: 'Highlands Ranch Water 2026 Water Quality Report (2025 monitoring)',
  sourceId: 'hrw_2026_ccr' as SourceId,
  typicalSources: 'Corrosion of household plumbing systems; erosion of natural deposits',
} as const

export const HRW_COPPER_LCR_PERIODS: readonly HrwCopperPeriod[] = [
  {
    id: '2024-h1',
    startIso: '2024-01-01',
    endIso: '2024-06-28',
    label: 'Jan 1 – Jun 28, 2024',
    shortLabel: 'Jan–Jun 2024',
    year: 2024,
    percentile90Ppm: 0.06,
    sampleSize: 457,
    sitesAboveActionLevel: 0,
    tapRangeLowPpm: 0,
    tapRangeHighPpm: 0.826,
    actionLevelExceedance: false,
    unit: 'ppm',
    program: 'hrw_lcr_tap_sampling',
    sourceId: 'hrw_2025_ccr',
    reportLabel: 'Highlands Ranch Water 2025 Water Quality Report',
  },
  {
    id: '2024-h2',
    startIso: '2024-07-01',
    endIso: '2024-12-30',
    label: 'Jul 1 – Dec 30, 2024',
    shortLabel: 'Jul–Dec 2024',
    year: 2024,
    percentile90Ppm: 0.06,
    sampleSize: 478,
    sitesAboveActionLevel: 0,
    tapRangeLowPpm: 0.0022,
    tapRangeHighPpm: 0.1832,
    actionLevelExceedance: false,
    unit: 'ppm',
    program: 'hrw_lcr_tap_sampling',
    sourceId: 'hrw_2025_ccr',
    reportLabel: 'Highlands Ranch Water 2025 Water Quality Report',
  },
  {
    id: '2025-h1',
    startIso: '2025-01-07',
    endIso: '2025-03-19',
    label: 'Jan 7 – Mar 19, 2025',
    shortLabel: 'Jan–Mar 2025',
    year: 2025,
    percentile90Ppm: 0.33,
    sampleSize: 103,
    sitesAboveActionLevel: 0,
    tapRangeLowPpm: 0.03,
    tapRangeHighPpm: 0.48,
    actionLevelExceedance: false,
    unit: 'ppm',
    program: 'hrw_lcr_tap_sampling',
    sourceId: 'hrw_2026_ccr',
    reportLabel: 'Highlands Ranch Water 2026 Water Quality Report',
  },
  {
    id: '2025-h2',
    startIso: '2025-07-08',
    endIso: '2025-10-29',
    label: 'Jul 8 – Oct 29, 2025',
    shortLabel: 'Jul–Oct 2025',
    year: 2025,
    percentile90Ppm: 0.27,
    sampleSize: 101,
    sitesAboveActionLevel: 0,
    tapRangeLowPpm: 0.035,
    tapRangeHighPpm: 0.527,
    actionLevelExceedance: false,
    unit: 'ppm',
    program: 'hrw_lcr_tap_sampling',
    sourceId: 'hrw_2026_ccr',
    reportLabel: 'Highlands Ranch Water 2026 Water Quality Report',
  },
] as const

export function mostRecentCopperPeriod(): HrwCopperPeriod {
  return HRW_COPPER_LCR_PERIODS[HRW_COPPER_LCR_PERIODS.length - 1]
}
