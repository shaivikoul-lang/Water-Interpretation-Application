import {
  ARSENIC_REGULATION,
  HRW_ARSENIC_CCR_META,
  HRW_ARSENIC_CCR_YEARS,
  mostRecentArsenicYear,
  type HrwArsenicYear,
} from '../data/hrwArsenicCcr'
import { latestRowForAnalyte } from './derive'
import type { SourceId } from './sourceRegistry'
import type { PwsPayload, YearRow } from '../types/water'

export type ArsenicTrendKind = 'decreasing' | 'increasing' | 'relatively_stable' | 'insufficient_data'

export type ArsenicTrendResult = {
  kind: ArsenicTrendKind
  message: string
}

export function formatPpb(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const tenths = Math.round(n * 10) / 10
  if (Math.abs(tenths - n) < 1e-9) return n.toFixed(1)
  return String(Number(n.toFixed(2)))
}

export function percentOfMcl(valuePpb: number, mclPpb: number): number {
  if (mclPpb <= 0) return 0
  return valuePpb / mclPpb
}

export function percentOfMclRounded(valuePpb: number, mclPpb: number): number {
  return Math.round(percentOfMcl(valuePpb, mclPpb) * 100)
}

export function arsenicComparison(year: HrwArsenicYear = mostRecentArsenicYear()) {
  const mcl = ARSENIC_REGULATION.mclPpb
  return {
    year,
    mclPpb: mcl,
    share: percentOfMcl(year.averagePpb, mcl),
    sharePct: percentOfMclRounded(year.averagePpb, mcl),
    unit: year.unit,
    programLabel: HRW_ARSENIC_CCR_META.programLabel,
    reportLabel: year.reportLabel,
    sourceId: year.sourceId,
  }
}

export function deriveArsenicTrend(years: readonly HrwArsenicYear[] = HRW_ARSENIC_CCR_YEARS): ArsenicTrendResult {
  const comparable = [...years].sort((a, b) => a.year - b.year)
  if (comparable.length < 3) {
    const first = comparable[0]
    const last = comparable[comparable.length - 1]
    if (first && last && first.year !== last.year) {
      return {
        kind: 'insufficient_data',
        message: `Official Highlands Ranch Water reports show a ${first.year} average of ${formatPpb(first.averagePpb)} ${first.unit} and a ${last.year} average of ${formatPpb(last.averagePpb)} ${last.unit}. Two years are not enough to determine a long-term trend.`,
      }
    }
    return {
      kind: 'insufficient_data',
      message:
        'Not enough comparable official Consumer Confidence Report years are available to determine a long-term trend.',
    }
  }
  const first = comparable[0]
  const last = comparable[comparable.length - 1]
  if (first.averagePpb === 0) {
    return {
      kind: 'insufficient_data',
      message:
        'Not enough comparable official Consumer Confidence Report years are available to determine a long-term trend.',
    }
  }
  const change = (last.averagePpb - first.averagePpb) / first.averagePpb
  if (Math.abs(change) < 0.08) {
    return {
      kind: 'relatively_stable',
      message: 'Available official averages have remained relatively stable.',
    }
  }
  if (change < 0) {
    return {
      kind: 'decreasing',
      message: 'The most recent official average is lower than the earliest comparable report year.',
    }
  }
  return {
    kind: 'increasing',
    message: 'The most recent official average is higher than the earliest comparable report year.',
  }
}

export function rangeText(year: HrwArsenicYear): string {
  return `${formatPpb(year.rangeLowPpb)}–${formatPpb(year.rangeHighPpb)} ${year.unit}`
}

/** CDPHE yearly summaries from the WaterLens extract — companion history, not the verdict source. */
export function cdpheArsenicYears(water: PwsPayload): YearRow[] {
  const pack = water.analytes.find((a) => a.analyte_name === 'Arsenic')
  if (!pack) return []
  return [...pack.by_year]
    .filter((row) => row.avg_concentration != null || row.max_concentration != null)
    .sort((a, b) => a.year - b.year)
}

export function cdpheArsenicLatestYear(water: PwsPayload): number | null {
  const pack = water.analytes.find((a) => a.analyte_name === 'Arsenic')
  if (!pack || !latestRowForAnalyte(pack)) return null
  return latestRowForAnalyte(pack)!.year
}

export function formatExtractPpb(n: number | null | undefined): string {
  if (n == null) return '—'
  return formatPpb(n)
}

export const ARSENIC_COPY = {
  title: 'Arsenic',
  subtitle:
    'Arsenic is a naturally occurring element in rock and soil. Public-system monitoring describes the utility result at the entry point — not the water at your specific faucet.',
  verdict: 'Below the federal drinking-water limit',
  pathwayHeading: 'How arsenic can reach water',
  pathwayCaption:
    'Finding arsenic in a system result does not, by itself, tell you the concentration at one faucet.',
  compareHeading: 'How does the system result compare with the MCL?',
  mclHelp:
    'A Maximum Contaminant Level is an enforceable federal drinking-water limit. For arsenic, the current EPA MCL is 10 ppb. The Maximum Contaminant Level Goal (MCLG) is 0 ppb. An MCLG is a non-enforceable health goal, not the compliance number used on this page.',
  samplesExplain:
    'These official results are entry-point averages from a small number of samples each year. They describe treated water leaving the plant, not the result at one household faucet.',
  sourceHeading: 'This is a source-water story',
  sourceBody: [
    'In this area, arsenic is mainly a geology and groundwater story — not a household plumbing story like lead.',
    'Highlands Ranch Water’s official table lists typical sources as erosion of natural deposits, runoff from orchards, and runoff from glass and electronics production wastes.',
    'Public-system monitoring cannot tell you the arsenic concentration at your specific faucet. A certified laboratory test is the way to answer a home-specific question.',
  ],
  sourceName: 'Entry-point monitoring',
  ruleUpdateHeading: 'EPA arsenic standard',
  ruleUpdateBody:
    'EPA adopted the current 10 ppb arsenic MCL in 2001, with a 2006 compliance deadline. That 10 ppb limit is the standard used for the 2025 Highlands Ranch Water comparison on this page. The earlier 50 ppb MCL is history, not the current compliance number.',
  chartNote:
    'The verdict card uses official Highlands Ranch Water Consumer Confidence Report averages. CDPHE yearly summaries in the WaterLens extract are a labeled companion series. They are not mixed into the 8% comparison.',
  nextSteps: [
    {
      title: 'Read the latest utility report',
      body: 'The 2026 Water Quality Report is the official source for the 2025 entry-point average.',
    },
    {
      title: 'Remember this is a system result',
      body: 'Entry-point monitoring does not determine the concentration at your individual faucet.',
    },
    {
      title: 'Test your faucet if you are concerned',
      body: 'A certified laboratory test is the way to know a home-specific arsenic result.',
    },
  ],
  limitation:
    'These results describe official public-water-system entry-point monitoring. They do not test the water at your individual faucet.',
  footerCitations: [
    { id: 'hrw_2026_ccr', text: 'Highlands Ranch Water — 2026 Water Quality Report' },
    { id: 'hrw_2025_ccr', text: 'Highlands Ranch Water — 2025 Water Quality Report' },
    { id: 'epa_arsenic_rule', text: 'EPA — Drinking water arsenic rule history' },
    { id: 'cdphe_hrw_monitoring', text: 'CDPHE public drinking water monitoring — PWS CO0118015' },
  ] as const satisfies readonly { id: SourceId; text: string }[],
} as const

export {
  ARSENIC_REGULATION,
  HRW_ARSENIC_CCR_META,
  HRW_ARSENIC_CCR_YEARS,
  mostRecentArsenicYear,
}
