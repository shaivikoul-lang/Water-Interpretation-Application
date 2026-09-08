import {
  HRW_LEAD_LCR_META,
  HRW_LEAD_LCR_PERIODS,
  HRW_LEAD_SERVICE_LINES,
  LEAD_REGULATION,
  mostRecentLeadPeriod,
  type HrwLeadPeriod,
} from '../data/hrwLeadLcr'
import { latestRowForAnalyte } from './derive'
import type { SourceId } from './sourceRegistry'
import type { PwsPayload, YearRow } from '../types/water'

export type LeadTrendKind = 'decreasing' | 'increasing' | 'relatively_stable' | 'insufficient_data'

export type LeadTrendResult = {
  kind: LeadTrendKind
  message: string
}

export type LeadChartPoint = {
  id: string
  label: string
  shortLabel: string
  sortKey: number
  percentile90Ppb: number
  sampleSize: number
  sourceId: SourceId
  program: string
}

export function formatPpb(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function percentOfActionLevel(valuePpb: number, actionLevelPpb: number): number {
  if (actionLevelPpb <= 0) return 0
  return valuePpb / actionLevelPpb
}

export function percentOfActionLevelRounded(valuePpb: number, actionLevelPpb: number): number {
  return Math.round(percentOfActionLevel(valuePpb, actionLevelPpb) * 100)
}

export function leadComparison(period: HrwLeadPeriod = mostRecentLeadPeriod()) {
  const actionLevel = LEAD_REGULATION.currentActionLevelPpb
  return {
    period,
    actionLevelPpb: actionLevel,
    share: percentOfActionLevel(period.percentile90Ppb, actionLevel),
    sharePct: percentOfActionLevelRounded(period.percentile90Ppb, actionLevel),
    unit: period.unit,
    programLabel: HRW_LEAD_LCR_META.programLabel,
    reportLabel: HRW_LEAD_LCR_META.reportLabel,
    sourceId: period.sourceId,
  }
}

export function leadChartPoints(): LeadChartPoint[] {
  return HRW_LEAD_LCR_PERIODS.map((period) => ({
    id: period.id,
    label: period.label,
    shortLabel: period.shortLabel,
    sortKey: Date.parse(period.startIso),
    percentile90Ppb: period.percentile90Ppb,
    sampleSize: period.sampleSize,
    sourceId: period.sourceId,
    program: period.program,
  }))
}

/** Only compares official LCR 90th-percentile periods from the same program. */
export function deriveLeadTrend(points: LeadChartPoint[]): LeadTrendResult {
  const comparable = [...points].sort((a, b) => a.sortKey - b.sortKey)
  const years = new Set(
    comparable.map((p) => new Date(p.sortKey).getUTCFullYear()),
  )
  if (comparable.length < 3 || years.size < 2) {
    return {
      kind: 'insufficient_data',
      message:
        'Not enough comparable historical periods are available to determine a long-term trend.',
    }
  }
  const first = comparable[0]
  const last = comparable[comparable.length - 1]
  if (first.percentile90Ppb === 0) {
    return {
      kind: 'insufficient_data',
      message:
        'Not enough comparable historical periods are available to determine a long-term trend.',
    }
  }
  const change = (last.percentile90Ppb - first.percentile90Ppb) / first.percentile90Ppb
  if (Math.abs(change) < 0.08) {
    return {
      kind: 'relatively_stable',
      message: 'Available 90th-percentile results have remained relatively stable.',
    }
  }
  if (change < 0) {
    return {
      kind: 'decreasing',
      message:
        'The most recent 90th-percentile result is lower than the earliest comparable monitoring period.',
    }
  }
  return {
    kind: 'increasing',
    message:
      'The most recent 90th-percentile result is higher than the earliest comparable monitoring period.',
  }
}

export function meaningText(period: HrwLeadPeriod = mostRecentLeadPeriod()): string {
  const cmp = leadComparison(period)
  return `Highlands Ranch Water’s most recent ${period.year} monitoring period reported a 90th-percentile lead result of ${formatPpb(period.percentile90Ppb)} ${period.unit}, below the current EPA ${formatPpb(cmp.actionLevelPpb)} ${period.unit} action level. This means the public water system did not have an action-level exceedance during that monitoring period. It does NOT guarantee that every individual faucet has the same result, because household plumbing can affect lead concentrations.`
}

export function sitesStatusText(period: HrwLeadPeriod = mostRecentLeadPeriod()): string {
  return `${period.sitesAboveActionLevel} of ${period.sampleSize} sampled sites were above the ${formatPpb(LEAD_REGULATION.currentActionLevelPpb)} ${period.unit} action level.`
}

export type LeadCheck = {
  id: string
  name: string
  available: boolean
  statusLead: string
}

export function leadChecks(): LeadCheck[] {
  return [
    {
      id: 'p90',
      name: '90th-percentile system lead result',
      available: true,
      statusLead: 'Official HRW monitoring data available',
    },
    {
      id: 'sites',
      name: 'Sites above the action level',
      available: true,
      statusLead: 'Official HRW monitoring data available',
    },
    {
      id: 'inventory',
      name: 'Lead service-line inventory',
      available: true,
      statusLead: 'Official HRW guidance available',
    },
    {
      id: 'faucet',
      name: 'Your specific faucet lead level',
      available: false,
      statusLead: 'Not determined by public-system monitoring',
    },
  ]
}

/** CDPHE yearly-max rows are not LCR 90th-percentile results. */
export function cdpheLeadYearlyMaxima(water: PwsPayload): YearRow[] {
  const pack = water.analytes.find((a) => a.analyte_name === 'Lead')
  if (!pack) return []
  return pack.by_year.filter((row) => row.max_concentration != null)
}

export function cdpheLeadLatestYear(water: PwsPayload): number | null {
  const pack = water.analytes.find((a) => a.analyte_name === 'Lead')
  if (!pack || !latestRowForAnalyte(pack)) return null
  return latestRowForAnalyte(pack)!.year
}

export function tapRangeText(period: HrwLeadPeriod): string {
  return `${formatPpb(period.tapRangeLowPpb)}–${formatPpb(period.tapRangeHighPpb)} ${period.unit}`
}

export const LEAD_COPY = {
  title: 'Lead',
  subtitle:
    'Lead is a metal that can enter drinking water from older solder, faucets, and other household plumbing. Public-system monitoring describes the utility result — not the water at your specific faucet.',
  verdict: 'Below the current EPA action level',
  pathwayHeading: 'How lead can reach water',
  pathwayCaption:
    'Finding lead at a faucet does not, by itself, mean it came from the public water system.',
  compareHeading: 'How does the system result compare with the action level?',
  actionLevelIsNotMcl:
    'The Lead and Copper Rule uses the 90th percentile of tap samples to determine whether a public water system exceeds the action level. Lead does not use a federal health-based MCL in the same way as some other contaminants.',
  percentileHelp:
    'The 90th percentile means that 90% of the tap samples were at or below this result. It does not mean that 90% of homes have exactly this concentration.',
  sitesExplain:
    'A public-water-system action-level exceedance is based on the 90th-percentile result, not whether any individual sample exceeds the action level.',
  householdHeading: 'Your utility result is not your faucet result',
  householdBody: [
    'Highlands Ranch Water reports that there are no lead service lines, goosenecks, or galvanized service pipes in its service area.',
    'However, lead can still enter drinking water from older solder, faucets, fixtures, and other household plumbing materials.',
    'Public-system monitoring cannot tell you the lead concentration at your specific faucet. The only way to know your faucet’s lead level is to have that water tested by a certified laboratory.',
  ],
  inventoryName: 'Lead service lines',
  dataNote:
    'WaterLens only displays information it can trace to an official source. It does not estimate your faucet-level lead concentration.',
  chartEmpty:
    'Not enough comparable historical periods are available to determine a long-term trend.',
  chartNote:
    'Only official Highlands Ranch Water Lead and Copper Rule 90th-percentile results are plotted. CDPHE yearly-maximum summaries in the WaterLens extract are a different measurement and are not shown as 90th-percentile points.',
  nextSteps: [
    {
      title: 'Use cold water',
      body: 'Use cold water for drinking, cooking, and preparing baby formula.',
    },
    {
      title: 'Flush water that has been sitting',
      body: 'If water has been unused for several hours, run the cold tap before using it for drinking or cooking.',
    },
    {
      title: 'Clean faucet aerators',
      body: 'Aerators can collect small particles. Highlands Ranch Water recommends cleaning them periodically.',
    },
    {
      title: 'Test your faucet if you are concerned',
      body: 'System monitoring does not determine your individual faucet level. A certified laboratory test is the way to know your specific result.',
    },
  ],
  ruleUpdateHeading: '2027 rule update',
  ruleUpdateBody:
    'Starting November 1, 2027, EPA’s Lead and Copper Rule Improvements use a revised lead action level. That future threshold does not govern the 2024 monitoring comparison on this page.',
  sourcesIntro:
    'Information on this page is from Highlands Ranch Water, the U.S. EPA, and publicly available drinking-water data. This content is for educational purposes and does not replace advice from your water utility.',
  limitation:
    'These results describe official public-water-system Lead and Copper Rule monitoring. They do not test the water at your individual faucet. Household plumbing can affect lead concentrations.',
  sourcesNote:
    'Water quality data and guidance may be updated over time. Always refer to the latest information from Highlands Ranch Water and the EPA.',
  footerCitations: [
    { id: 'hrw_lead_copper_sampling', text: 'Highlands Ranch Water — Lead and Copper Sampling' },
    { id: 'hrw_2025_ccr', text: 'Highlands Ranch Water — 2025 Water Quality Report' },
    { id: 'epa_lead_drinking_water', text: 'EPA — Basic Information about Lead in Drinking Water' },
    { id: 'epa_lcri', text: 'EPA — Lead and Copper Rule Improvements' },
    { id: 'cdphe_hrw_monitoring', text: 'CDPHE public drinking water monitoring — PWS CO0118015' },
  ] as const satisfies readonly { id: SourceId; text: string }[],
} as const

export { HRW_LEAD_LCR_META, HRW_LEAD_LCR_PERIODS, HRW_LEAD_SERVICE_LINES, LEAD_REGULATION, mostRecentLeadPeriod }
