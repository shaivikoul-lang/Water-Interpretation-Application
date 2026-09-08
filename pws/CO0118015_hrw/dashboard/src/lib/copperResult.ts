import {
  COPPER_REGULATION,
  HRW_COPPER_LCR_META,
  HRW_COPPER_LCR_PERIODS,
  mostRecentCopperPeriod,
  type HrwCopperPeriod,
} from '../data/hrwCopperLcr'
import type { SourceId } from './sourceRegistry'

export function formatPpm(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

export function percentOfActionLevelRounded(value: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.round((value / limit) * 100)
}

export function copperComparison(period: HrwCopperPeriod = mostRecentCopperPeriod()) {
  const actionLevel = COPPER_REGULATION.currentActionLevelPpm
  return {
    period,
    actionLevelPpm: actionLevel,
    sharePct: percentOfActionLevelRounded(period.percentile90Ppm, actionLevel),
    unit: period.unit,
    reportLabel: period.reportLabel,
    sourceId: period.sourceId,
    programLabel: HRW_COPPER_LCR_META.programLabel,
  }
}

export function deriveCopperTrend(periods: readonly HrwCopperPeriod[] = HRW_COPPER_LCR_PERIODS) {
  const comparable = [...periods].sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso))
  if (comparable.length < 3) {
    return {
      kind: 'insufficient_data' as const,
      message:
        'Not enough comparable official monitoring periods are available to determine a long-term trend.',
    }
  }
  const first = comparable[0]
  const last = comparable[comparable.length - 1]
  if (first.percentile90Ppm === 0) {
    return {
      kind: 'insufficient_data' as const,
      message:
        'Not enough comparable official monitoring periods are available to determine a long-term trend.',
    }
  }
  const change = (last.percentile90Ppm - first.percentile90Ppm) / first.percentile90Ppm
  if (Math.abs(change) < 0.08) {
    return {
      kind: 'relatively_stable' as const,
      message: 'Available 90th-percentile copper results have remained relatively stable.',
    }
  }
  if (change < 0) {
    return {
      kind: 'decreasing' as const,
      message:
        'The most recent 90th-percentile copper result is lower than the earliest comparable monitoring period.',
    }
  }
  return {
    kind: 'increasing' as const,
    message:
      'The most recent 90th-percentile copper result is higher than the earliest comparable monitoring period.',
  }
}

export function tapRangeText(period: HrwCopperPeriod): string {
  return `${formatPpm(period.tapRangeLowPpm)}–${formatPpm(period.tapRangeHighPpm)} ${period.unit}`
}

export const COPPER_COPY = {
  title: 'Copper',
  subtitle:
    'Copper can enter drinking water from household plumbing, faucets, and copper pipes. Public-system monitoring describes the utility result — not the water at your specific faucet.',
  verdict: 'Below the current EPA action level',
  pathwayHeading: 'How copper can reach water',
  pathwayCaption:
    'Finding copper at a faucet does not, by itself, mean it came from the treatment plant.',
  actionLevelHelp:
    'The Lead and Copper Rule uses the 90th percentile of tap samples to determine whether a public water system exceeds the copper action level. Copper does not use a simple MCL in the same way as some other contaminants.',
  percentileHelp:
    'The 90th percentile means that 90% of the tap samples were at or below this result. It does not mean that 90% of homes have exactly this concentration.',
  sitesExplain:
    'A public-water-system action-level exceedance is based on the 90th-percentile result, not whether any individual sample exceeds the action level.',
  householdHeading: 'Your utility result is not your faucet result',
  householdBody: [
    'Highlands Ranch Water reports that service lines in this area are Type K copper — not lead.',
    'Copper can still enter drinking water from those service lines, household pipes, faucets, and fixtures, especially when water sits in plumbing.',
    'Public-system monitoring cannot tell you the copper concentration at your specific faucet. A certified laboratory test is the way to answer a home-specific question.',
  ],
  inventoryName: 'Service lines here',
  inventoryStatus: 'Type K copper — no lead service lines identified',
  ruleUpdateHeading: 'EPA copper action level',
  ruleUpdateBody:
    'The current EPA copper action level is 1.3 ppm. The MCLG is also 1.3 ppm. That action level is the standard used for the latest Highlands Ranch Water comparison on this page.',
  chartNote:
    'Only official Highlands Ranch Water Lead and Copper Rule 90th-percentile copper results are shown. CDPHE yearly summaries in the WaterLens extract are older and are not mixed into this comparison.',
  limitation:
    'These results describe official public-water-system Lead and Copper Rule monitoring. They do not test the water at your individual faucet. Household plumbing can affect copper concentrations.',
  footerCitations: [
    { id: 'hrw_lead_copper_sampling', text: 'Highlands Ranch Water — Lead and Copper Sampling' },
    { id: 'hrw_2026_ccr', text: 'Highlands Ranch Water — 2026 Water Quality Report' },
    { id: 'hrw_2025_ccr', text: 'Highlands Ranch Water — 2025 Water Quality Report' },
    { id: 'epa_lcri', text: 'EPA — Lead and Copper Rule Improvements' },
    { id: 'cdphe_hrw_monitoring', text: 'CDPHE public drinking water monitoring — PWS CO0118015' },
  ] as const satisfies readonly { id: SourceId; text: string }[],
} as const

export { COPPER_REGULATION, HRW_COPPER_LCR_META, HRW_COPPER_LCR_PERIODS, mostRecentCopperPeriod }
