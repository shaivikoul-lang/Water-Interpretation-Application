import type { SourceId } from '../lib/sourceRegistry'

/** Current and future Lead and Copper Rule action levels — not JSX. */
export const LEAD_REGULATION = {
  currentActionLevelPpb: 15,
  currentRuleLabel: 'EPA Lead Action Level',
  currentRuleName: 'Lead and Copper Rule',
  lcriActionLevelPpb: 10,
  lcriEffectiveIso: '2027-11-01',
  lcriEffectiveLabel: 'November 1, 2027',
  unit: 'ppb',
  sourceId: 'epa_lcri' as SourceId,
} as const

export type HrwLeadPeriod = {
  id: string
  startIso: string
  endIso: string
  label: string
  shortLabel: string
  year: number
  percentile90Ppb: number
  sampleSize: number
  sitesAboveActionLevel: number
  tapRangeLowPpb: number
  tapRangeHighPpb: number
  actionLevelExceedance: boolean
  unit: 'ppb'
  program: 'hrw_lcr_tap_sampling'
  sourceId: SourceId
}

export const HRW_LEAD_LCR_META = {
  program: 'hrw_lcr_tap_sampling',
  programLabel: 'Highlands Ranch Water Lead and Copper Rule tap sampling',
  reportLabel: 'Highlands Ranch Water 2025 Water Quality Report (2024 monitoring)',
  sourceId: 'hrw_2025_ccr' as SourceId,
  note: 'These 90th-percentile results come from official HRW Lead and Copper Rule monitoring reported in the 2025 Water Quality Report. They are not the mockup numbers and are not mixed with CDPHE yearly-maximum summaries.',
} as const

/** Official 2024 LCR monitoring periods from the HRW 2025 Water Quality Report. */
export const HRW_LEAD_LCR_PERIODS: readonly HrwLeadPeriod[] = [
  {
    id: '2024-h1',
    startIso: '2024-01-01',
    endIso: '2024-06-28',
    label: 'Jan 1 – Jun 28, 2024',
    shortLabel: 'Jan–Jun 2024',
    year: 2024,
    percentile90Ppb: 4.0,
    sampleSize: 457,
    sitesAboveActionLevel: 7,
    tapRangeLowPpb: 0,
    tapRangeHighPpb: 75.3,
    actionLevelExceedance: false,
    unit: 'ppb',
    program: 'hrw_lcr_tap_sampling',
    sourceId: 'hrw_2025_ccr',
  },
  {
    id: '2024-h2',
    startIso: '2024-07-01',
    endIso: '2024-12-30',
    label: 'Jul 1 – Dec 30, 2024',
    shortLabel: 'Jul–Dec 2024',
    year: 2024,
    percentile90Ppb: 3.6,
    sampleSize: 478,
    sitesAboveActionLevel: 3,
    tapRangeLowPpb: 0,
    tapRangeHighPpb: 44.6,
    actionLevelExceedance: false,
    unit: 'ppb',
    program: 'hrw_lcr_tap_sampling',
    sourceId: 'hrw_2025_ccr',
  },
] as const

export const HRW_LEAD_SERVICE_LINES = {
  leadServiceLinesIdentified: 0,
  goosenecksIdentified: 0,
  galvanizedServicePipesIdentified: 0,
  areaLabel: 'Highlands Ranch Water service area',
  statusLead: 'None identified in the Highlands Ranch Water service area',
  sourceId: 'hrw_lead_copper_sampling' as SourceId,
} as const

export function mostRecentLeadPeriod(): HrwLeadPeriod {
  return HRW_LEAD_LCR_PERIODS[HRW_LEAD_LCR_PERIODS.length - 1]
}
