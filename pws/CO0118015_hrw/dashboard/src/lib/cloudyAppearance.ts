import { latestRowForAnalyte } from './derive'
import type { SourceId } from './sourceRegistry'
import type { AnalytePack, PwsPayload, YearRow } from '../types/water'

const TURBIDITY_NAME = 'Turbidity'
const TDS_NAMES = ['TDS', 'Total dissolved solids', 'Total Dissolved Solids'] as const
const HARDNESS_NAMES = ['Hardness', 'Hardness (as CaCO3)', 'Hardness (as CaCO₃)'] as const

export type CloudyCheckKind = 'measurement' | 'guidance'

export type CloudyCheck = {
  id: string
  name: string
  kind: CloudyCheckKind
  available: boolean
  statusLead: string
  statusDetail: string | null
  latestYear: number | null
  latestRow: YearRow | null
  pack: AnalytePack | null
}

export const CLOUDY_COPY = {
  title: 'Cloudy / white appearance',
  subtitle: 'Water looks cloudy, milky, or white.',
  takeaway: [
    'Highlands Ranch Water says cloudy or milky tap water is usually caused by dissolved air. This is not harmful. If the cloudiness is caused by air, a glass of water should begin clearing from the bottom to the top as the bubbles rise.',
    'If the water does not clear, contains visible particles, or the change is unusual or persistent, contact Highlands Ranch Water.',
  ],
  meaning: [
    'Water in distribution pipes is under pressure and can hold dissolved air. Very cold water can also hold more air. When water leaves the faucet, the pressure drops and tiny air bubbles can form, making the water look cloudy or milky.',
    'Highlands Ranch Water says this condition is usually harmless and often resolves on its own. To check, fill a clear glass and let it sit. If dissolved air is the cause, the water should clear from the bottom upward as the bubbles rise.',
  ],
  airVsTurbidity:
    'Dissolved air is a common visual cause described by Highlands Ranch Water. Turbidity is a separate, regulated measure of particles and filtration performance — not the same thing as air bubbles in a glass.',
  checkedIntro:
    'Based on what you noticed, WaterLens looked for relevant measurements and official guidance.',
  dataNote:
    'WaterLens only shows information it can trace to an official source. It does not estimate missing measurements.',
  regulatory:
    'Turbidity is a measure of water cloudiness and is used by drinking-water systems as an indicator of water quality and filtration effectiveness. EPA regulates turbidity through treatment-technique requirements rather than a single consumer health-based MCL. WaterLens does not make a compliance claim from the yearly summary numbers in this extract.',
  nextSteps: [
    {
      title: 'Let the water sit',
      body: 'Fill a clear glass and let it sit for a few minutes. If dissolved air is the cause, the water should clear from the bottom upward.',
    },
    {
      title: 'If desired, chill a pitcher',
      body: 'Highlands Ranch Water notes that cloudy water caused by dissolved air is safe to consume, but letting a pitcher stand may allow the bubbles to disappear.',
    },
    {
      title: 'Check whether it is limited to one faucet',
      body: 'If only one faucet is affected, household plumbing or a fixture may be involved.',
    },
    {
      title: 'Contact HRW if it does not clear or looks unusual',
      body: 'If the water does not clear, contains visible particles, is discolored, or the condition is persistent or unusual, contact Highlands Ranch Water.',
    },
  ],
  sourcesIntro:
    'Information on this page is from Highlands Ranch Water, the U.S. EPA, and publicly available drinking-water data. This content is for educational purposes and does not replace advice from your water utility.',
  sourcesNote:
    'Water quality data and guidance may be updated over time. Always refer to the latest information from Highlands Ranch Water and the EPA.',
  limitation:
    'These results describe public monitoring and official guidance for Highlands Ranch Water. They do not test the water at your individual faucet. Cloudy appearance can have household-specific causes, and appearance alone does not identify a contaminant.',
  footerCitations: [
    { id: 'hrw_water_quality_faq', text: 'Highlands Ranch Water – Water Quality FAQs' },
    { id: 'hrw_report_concern', text: 'Highlands Ranch Water – Report a Water Concern' },
    { id: 'hrw_water_quality_indicators', text: 'Highlands Ranch Water – Water Quality Indicators' },
    {
      id: 'epa_primary_drinking_water_regulations',
      text: 'EPA – National Primary Drinking Water Regulations (turbidity treatment technique)',
    },
    { id: 'cdphe_hrw_monitoring', text: 'CDPHE public drinking water monitoring — PWS CO0118015' },
  ] as const satisfies readonly { id: SourceId; text: string }[],
} as const

function findExact(water: PwsPayload, name: string): AnalytePack | null {
  return water.analytes.find((a) => a.analyte_name === name) ?? null
}

function findFirst(water: PwsPayload, names: readonly string[]): AnalytePack | null {
  for (const name of names) {
    const pack = findExact(water, name)
    if (pack) return pack
  }
  return null
}

function isUsable(pack: AnalytePack | null): pack is AnalytePack {
  return !!pack && pack.by_year.length > 0 && latestRowForAnalyte(pack) != null
}

function measurementCheck(
  id: string,
  displayName: string,
  pack: AnalytePack | null,
): CloudyCheck {
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

export function cloudyChecks(water: PwsPayload): CloudyCheck[] {
  return [
    measurementCheck('turbidity', 'Turbidity', findExact(water, TURBIDITY_NAME)),
    {
      id: 'hrw_guidance',
      name: 'HRW guidance',
      kind: 'guidance',
      available: true,
      statusLead: 'Official explanation for cloudy/milky water available',
      statusDetail: 'Source: Highlands Ranch Water',
      latestYear: null,
      latestRow: null,
      pack: null,
    },
    measurementCheck('tds', 'Total dissolved solids (TDS)', findFirst(water, TDS_NAMES)),
    measurementCheck('hardness', 'Hardness', findFirst(water, HARDNESS_NAMES)),
  ]
}

export function cloudyEvidenceItems(checks: CloudyCheck[]): CloudyCheck[] {
  return checks.filter((item) => item.kind === 'measurement' && item.available && item.latestRow)
}

export function formatMeasurement(row: YearRow): string {
  if (row.max_concentration == null) return '—'
  const n = row.max_concentration
  const formatted = Number.isInteger(n) ? String(n) : String(n)
  return `${formatted} ${row.unit ?? ''}`.trim()
}

export function turbidityReferenceLabel(row: YearRow): string {
  if (row.sdwa_limit != null) {
    return `Federal reference line in this extract: ${row.sdwa_limit} ${row.unit ?? 'NTU'} — not a compliance verdict`.trim()
  }
  return 'No comparison value in this extract'
}

export function cloudyDataThroughYear(checks: CloudyCheck[]): number | null {
  const years = cloudyEvidenceItems(checks)
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

export function turbidityTrend(pack: AnalytePack | null): string {
  if (!pack) return 'Not enough years to describe a trend'
  const scored = pack.by_year.filter((r) => r.score_available && r.risk_score != null)
  if (scored.length < 2) {
    return 'This extract does not auto-score turbidity years, so WaterLens does not describe a trend here'
  }
  return 'Recent scored years are available in Explore Data'
}
