import { latestRowForAnalyte, trendDirection } from './derive'
import type { SourceId } from './sourceRegistry'
import type { AnalytePack, PwsPayload, YearRow } from '../types/water'

const TTHM_NAME = 'TTHM (total trihalomethanes)'
const HAA5_NAME = 'HAA5 (haloacetic acids)'

export type ChlorineCheckKind = 'measurement' | 'indicator' | 'guidance'

export type ChlorineCheck = {
  id: string
  name: string
  kind: ChlorineCheckKind
  available: boolean
  statusLead: string
  statusDetail: string | null
  latestYear: number | null
  latestRow: YearRow | null
  pack: AnalytePack | null
}

export const CHLORINE_COPY = {
  title: 'Chlorine / chemical smell',
  subtitle: 'Smells like chlorine, bleach, or a swimming pool.',
  takeaway:
    'Highlands Ranch Water uses chloramination to disinfect drinking water. A chlorine or chemical smell can come from the disinfectant itself or from its interaction with materials in household plumbing. A noticeable smell does not by itself mean the water is unsafe.',
  meaning: [
    'Highlands Ranch Water adds disinfectants to keep drinking water safe and uses chloramination, which combines chlorine and ammonia to form chloramine. A chlorine or chemical smell can be related to the disinfectant itself or to its interaction with organic material or plumbing in the home. Highlands Ranch Water also notes that taste and odor changes may be noticed seasonally, often from April through October.',
    'If the smell is unpleasant but otherwise typical, chilling the water may improve the taste or odor. If the smell is unusually strong, sudden, or persistent, contact Highlands Ranch Water.',
  ],
  meaningSources: [
    'hrw_water_quality_faq',
    'hrw_water_treatment',
    'epa_chloramines',
  ] as const satisfies readonly SourceId[],
  checkedIntro:
    'We looked at parameters related to disinfectants and disinfection byproducts in your public water data.',
  dbpNote:
    'TTHMs and HAA5 are disinfection byproducts tracked in public monitoring. They are not a smell score and do not identify the cause of a chlorine odor.',
  dataNote:
    'WaterLens only shows measurements it can trace to an official source. It does not estimate missing values.',
  regulatory:
    'EPA sets a Maximum Residual Disinfectant Level (MRDL) of 4.0 mg/L for chloramines. That is a health-based primary drinking-water standard for disinfectant residual, not an aesthetic smell score. WaterLens cannot compare a local residual value here because this extract does not include residual chlorine or chloramine with a verified compatible unit.',
  nextSteps: [
    {
      title: 'Try chilling your water',
      body: 'Keep a pitcher of cold water in the refrigerator. Highlands Ranch Water notes that this may improve an unpleasant chlorine taste or odor.',
    },
    {
      title: 'Use cold water for drinking and cooking',
      body: 'Hot water can change odor and taste and can interact more with household plumbing. This is practical guidance, not a statement that the water is unsafe.',
    },
    {
      title: 'Check whether the smell is only in your home',
      body: 'If the smell is limited to one faucet or one home, household plumbing or a fixture may be involved.',
    },
    {
      title: 'If the smell is unusually strong, sudden, or persistent',
      body: 'Contact Highlands Ranch Water. This page will not guess a contaminant from odor alone.',
    },
  ],
  sourcesIntro:
    'Information on this page is from Highlands Ranch Water, the U.S. EPA, and publicly available drinking-water data. This content is for educational purposes and does not replace advice from your water utility. It does not test the water at your individual faucet.',
  sourcesNote:
    'Water quality data and guidance may be updated over time. Always refer to the latest information from Highlands Ranch Water and the EPA.',
  limitation:
    'These results describe public monitoring and treatment information for Highlands Ranch Water. They do not test the water at your individual faucet. Taste and odor can also be affected by household plumbing and local conditions.',
  footerCitations: [
    { id: 'hrw_water_quality_faq', text: 'Highlands Ranch Water – Water Quality FAQs (Taste and Odor)' },
    { id: 'hrw_water_treatment', text: 'Highlands Ranch Water – Water Treatment (Chloramination)' },
    { id: 'hrw_water_quality_indicators', text: 'Highlands Ranch Water – Water Quality Indicators' },
    { id: 'epa_chloramines', text: 'EPA – Chloramines in Drinking Water' },
    { id: 'epa_primary_drinking_water_regulations', text: 'EPA – National Primary Drinking Water Regulations (MRDL for chloramines)' },
    { id: 'epa_secondary_standards', text: 'EPA – Secondary Drinking Water Standards (Taste and Odor Considerations)' },
  ] as const satisfies readonly { id: SourceId; text: string }[],
} as const

function findExact(water: PwsPayload, name: string): AnalytePack | null {
  return water.analytes.find((a) => a.analyte_name === name) ?? null
}

function isUsable(pack: AnalytePack | null): pack is AnalytePack {
  return !!pack && pack.by_year.length > 0 && latestRowForAnalyte(pack) != null
}

function measurementCheck(
  id: string,
  displayName: string,
  pack: AnalytePack | null,
): ChlorineCheck {
  if (!isUsable(pack)) {
    return {
      id,
      name: displayName,
      kind: 'measurement',
      available: false,
      statusLead: 'Not available in the current WaterLens dataset',
      statusDetail: null,
      latestYear: null,
      latestRow: null,
      pack: null,
    }
  }
  const row = latestRowForAnalyte(pack)!
  return {
    id,
    name: displayName,
    kind: 'measurement',
    available: true,
    statusLead: 'Historical monitoring data available',
    statusDetail: `Latest year in current extract: ${row.year}`,
    latestYear: row.year,
    latestRow: row,
    pack,
  }
}

/** Status list for “What did WaterLens check?” — measurements come from the extract. */
export function chlorineChecks(water: PwsPayload): ChlorineCheck[] {
  return [
    {
      id: 'residual_chlorine',
      name: 'Total residual chlorine',
      kind: 'indicator',
      available: false,
      statusLead: 'Not available in the current WaterLens dataset',
      statusDetail: null,
      latestYear: null,
      latestRow: null,
      pack: null,
    },
    measurementCheck('tthm', 'TTHMs (disinfection byproducts)', findExact(water, TTHM_NAME)),
    measurementCheck('haa5', 'HAA5 (disinfection byproducts)', findExact(water, HAA5_NAME)),
    {
      id: 'treatment',
      name: 'Treatment method',
      kind: 'guidance',
      available: true,
      statusLead: 'Highlands Ranch Water uses chloramination',
      statusDetail: 'Source: Highlands Ranch Water',
      latestYear: null,
      latestRow: null,
      pack: null,
    },
  ]
}

export function chlorineEvidenceItems(checks: ChlorineCheck[]): ChlorineCheck[] {
  return checks.filter((item) => item.kind === 'measurement' && item.available && item.latestRow)
}

export function formatMeasurement(row: YearRow): string {
  if (row.max_concentration == null) return '—'
  const n = row.max_concentration
  const formatted = Number.isInteger(n) ? String(n) : String(n)
  return `${formatted} ${row.unit ?? ''}`.trim()
}

export function referenceLabel(row: YearRow): string {
  if (row.sdwa_limit != null) {
    return `Comparison value in this dataset: ${row.sdwa_limit} ${row.unit ?? ''}`.trim()
  }
  return 'No comparison value in this extract'
}

export function chlorineDataThroughYear(checks: ChlorineCheck[]): number | null {
  const years = chlorineEvidenceItems(checks)
    .map((c) => c.latestYear)
    .filter((y): y is number => y != null)
  if (!years.length) return null
  return Math.max(...years)
}

export function dataSourceLabel(water: PwsPayload): string {
  const source = water.source?.trim()
  const dataset = water.dataset?.trim()
  if (source && dataset) return `${source} — ${dataset}`
  return source || dataset || 'Official public monitoring extract for this water system'
}

export function measurementTrend(pack: AnalytePack | null): string | null {
  if (!pack) return null
  const direction = trendDirection(pack)
  if (direction === 'up') return 'Recent scored years in this extract trend higher'
  if (direction === 'down') return 'Recent scored years in this extract trend lower'
  return 'Recent scored years in this extract are relatively flat'
}
