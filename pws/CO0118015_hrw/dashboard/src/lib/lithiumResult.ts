import {
  HRW_LITHIUM_UCMR_META,
  HRW_LITHIUM_UCMR_YEARS,
  LITHIUM_REGULATION,
  mostRecentLithiumYear,
  type HrwLithiumYear,
} from '../data/hrwLithiumUcmr'
import type { SourceId } from './sourceRegistry'

export function formatPpb(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return String(Number(n.toFixed(1)))
}

export function lithiumComparison(year: HrwLithiumYear = mostRecentLithiumYear()) {
  const hrl = LITHIUM_REGULATION.hrlPpb
  return {
    year,
    hrlPpb: hrl,
    sharePct: Math.round((year.averagePpb / hrl) * 100),
    unit: year.unit,
    reportLabel: year.reportLabel,
    sourceId: year.sourceId,
    programLabel: HRW_LITHIUM_UCMR_META.programLabel,
  }
}

export const LITHIUM_COPY = {
  title: 'Lithium',
  subtitle:
    'Lithium can occur naturally in rock, soil, and groundwater. Highlands Ranch Water reported it through EPA’s Unregulated Contaminant Monitoring Rule — not as a regulated MCL contaminant.',
  verdict: 'Detected. There is no federal drinking-water limit.',
  pathwayHeading: 'How lithium can reach water',
  pathwayCaption:
    'Finding lithium in a system result does not, by itself, tell you the concentration at one faucet.',
  hrlHelp:
    'EPA has not set a Maximum Contaminant Level for lithium. The 10 ppb Health Reference Level is a screening value from the Contaminant Candidate List process. It is not an enforceable drinking-water standard and is not used for compliance.',
  ucmrHelp:
    'UCMR 5 asks utilities to monitor certain unregulated substances, including lithium, so EPA can learn how often they occur. A detection is not a violation.',
  samplesExplain:
    'These official results are entry-point UCMR 5 samples. They describe treated water leaving the plant, not the result at one household faucet.',
  sourceHeading: 'This is a source-water story',
  sourceBody: [
    'Lithium in drinking water is mainly a geology and groundwater story — not a household plumbing story like lead or copper.',
    'EPA included lithium in UCMR 5 because it can occur naturally and because there is not yet a federal drinking-water standard.',
    'Public-system monitoring cannot tell you the lithium concentration at your specific faucet. A certified laboratory test is the way to answer a home-specific question.',
  ],
  sourceName: 'UCMR 5 entry-point monitoring',
  ruleUpdateHeading: 'No federal MCL — screening only',
  ruleUpdateBody:
    'EPA’s lithium Health Reference Level is 10 ppb. That screening value is not a legal limit. The UCMR 5 minimum reporting level is 9 ppb. USGS has also published a 60 ppb “drinking water only” benchmark for context.',
  chartNote:
    'The WaterLens extract does not yet include lithium yearly rows. This page uses the official Highlands Ranch Water UCMR 5 table from the 2025 Water Quality Report.',
  limitation:
    'These results describe official UCMR 5 entry-point monitoring. They do not test the water at your individual faucet, and they are not scored against a federal MCL.',
  footerCitations: [
    { id: 'hrw_2025_ccr', text: 'Highlands Ranch Water — 2025 Water Quality Report' },
    { id: 'epa_ucmr5', text: 'EPA — Fifth Unregulated Contaminant Monitoring Rule (UCMR 5)' },
    { id: 'epa_lithium_factsheet', text: 'EPA — Lithium in drinking water technical fact sheet' },
    { id: 'cdphe_hrw_monitoring', text: 'CDPHE public drinking water monitoring — PWS CO0118015' },
  ] as const satisfies readonly { id: SourceId; text: string }[],
} as const

export { HRW_LITHIUM_UCMR_META, HRW_LITHIUM_UCMR_YEARS, LITHIUM_REGULATION, mostRecentLithiumYear }
