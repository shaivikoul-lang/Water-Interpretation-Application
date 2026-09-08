import { latestRowForAnalyte } from './derive'
import type { SourceId } from './sourceRegistry'
import type { AnalytePack, PwsPayload, YearRow } from '../types/water'

const HARDNESS_NAMES = [
  'Hardness',
  'Hardness (as CaCO3)',
  'Hardness (as CaCO₃)',
  'Total hardness',
] as const
const CALCIUM_NAMES = ['Calcium'] as const
const MAGNESIUM_NAMES = ['Magnesium'] as const
const TDS_NAMES = ['TDS', 'Total dissolved solids', 'Total Dissolved Solids'] as const

export type ScaleCheckKind = 'measurement' | 'guidance'

export type ScaleCheck = {
  id: string
  name: string
  kind: ScaleCheckKind
  available: boolean
  statusLead: string
  statusDetail: string | null
  latestYear: number | null
  latestRow: YearRow | null
  pack: AnalytePack | null
}

export const SCALE_COPY = {
  title: 'Hard water scale',
  subtitle: 'White, chalky, or crusty buildup on faucets, showerheads, dishes, or appliances.',
  takeaway:
    'Hard water contains naturally occurring minerals, mainly calcium and magnesium. These minerals can leave white or chalky scale on faucets, showerheads, dishes, and appliances. Hard water is generally an aesthetic and household-maintenance issue, not evidence that the water is unsafe.',
  meaning: [
    'Hardness comes primarily from dissolved calcium and magnesium picked up as water moves through rock and soil.',
    'As water dries or is heated, these minerals can form white or chalky scale on fixtures, showerheads, dishes, water heaters, and other appliances.',
    'Hard water can reduce soap lather and contribute to mineral buildup over time, but hardness itself is not generally treated as a health-based drinking-water concern.',
  ],
  checkedIntro:
    'Based on what you noticed, WaterLens looked for relevant measurements and official guidance.',
  dataNote:
    'WaterLens only shows information it can trace to an official source. It does not estimate missing measurements.',
  evidenceEmpty:
    'This extract does not include hardness as CaCO3, calcium, magnesium, or TDS measurements. WaterLens does not estimate hardness by adding other minerals. Official guidance is listed under Sources and limitations.',
  regulatory:
    'EPA does not set a health-based federal drinking-water limit for hardness. Hardness is generally treated as an aesthetic and household-use characteristic rather than a health contaminant. EPA’s 500 mg/L value is a secondary, aesthetic guideline for total dissolved solids (TDS), not a hardness MCL and not a health-based limit.',
  nextSteps: [
    {
      title: 'Understand what the scale is',
      body: 'White scale is commonly associated with naturally occurring hardness minerals such as calcium and magnesium.',
    },
    {
      title: 'Clean existing scale',
      body: 'Mineral buildup can usually be removed with ordinary descaling methods appropriate for the fixture or appliance.',
    },
    {
      title: 'Consider water softening if scale is a recurring household problem',
      body: 'A home water softener can reduce hardness-related scale. This is an optional household treatment choice for convenience and appliance protection, not a required health intervention. WaterLens does not recommend a specific product or brand.',
    },
    {
      title: 'Still have questions?',
      body: 'Highlands Ranch Water can answer questions about local water quality. Hard-water scale is usually a household maintenance issue, not an urgent utility emergency.',
    },
  ],
  sourcesIntro:
    'Information on this page is from Highlands Ranch Water, the U.S. EPA, and publicly available drinking-water data. This content is for educational purposes and does not replace advice from your water utility.',
  sourcesNote:
    'Water quality data and guidance may be updated over time. Always refer to the latest information from Highlands Ranch Water and the EPA.',
  limitation:
    'These results describe official public-water information and general household guidance. They do not test the water at your individual faucet. Scale can vary by plumbing, appliance use, water temperature, and household conditions.',
  footerCitations: [
    { id: 'hrw_water_quality_faq', text: 'Highlands Ranch Water — Water Quality FAQs' },
    { id: 'hrw_water_quality_indicators', text: 'Highlands Ranch Water — Water Quality Indicators' },
    {
      id: 'epa_secondary_standards',
      text: 'EPA — Secondary Drinking Water Standards (aesthetic guidance)',
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
): ScaleCheck {
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
    statusLead: 'Official HRW / WaterLens data available',
    statusDetail: `Latest year in current extract: ${row.year}`,
    latestYear: row.year,
    latestRow: row,
    pack,
  }
}

export function scaleChecks(water: PwsPayload): ScaleCheck[] {
  return [
    measurementCheck('hardness', 'Hardness as CaCO3', findFirst(water, HARDNESS_NAMES)),
    measurementCheck('calcium', 'Calcium', findFirst(water, CALCIUM_NAMES)),
    measurementCheck('magnesium', 'Magnesium', findFirst(water, MAGNESIUM_NAMES)),
    measurementCheck('tds', 'Total dissolved solids (TDS)', findFirst(water, TDS_NAMES)),
    {
      id: 'hrw_guidance',
      name: 'Local water-quality guidance',
      kind: 'guidance',
      available: true,
      statusLead: 'Official Highlands Ranch Water information available',
      statusDetail: 'Source: Highlands Ranch Water',
      latestYear: null,
      latestRow: null,
      pack: null,
    },
  ]
}

export function scaleEvidenceItems(checks: ScaleCheck[]): ScaleCheck[] {
  return checks.filter((item) => item.kind === 'measurement' && item.available && item.latestRow)
}

export function scaleDataThroughYear(checks: ScaleCheck[]): number | null {
  const years = scaleEvidenceItems(checks)
    .map((c) => c.latestYear)
    .filter((y): y is number => y != null)
  if (!years.length) return null
  return Math.max(...years)
}

export function formatMeasurement(row: YearRow): string {
  if (row.max_concentration == null) return '—'
  const n = row.max_concentration
  const formatted = Number.isInteger(n) ? String(n) : String(n)
  return `${formatted} ${row.unit ?? ''}`.trim()
}

export function dataSourceLabel(water: PwsPayload): string {
  const source = water.source?.trim()
  const dataset = water.dataset?.trim()
  if (source && dataset) return `${source} — ${dataset}`
  return source || dataset || 'Official public monitoring extract for this water system'
}
