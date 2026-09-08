import { latestRowForAnalyte } from './derive'
import type { SourceId } from './sourceRegistry'
import type { AnalytePack, PwsPayload, YearRow } from '../types/water'

const TURBIDITY_NAME = 'Turbidity'
const IRON_NAMES = ['Iron'] as const
const MANGANESE_NAMES = ['Manganese'] as const
const COLOR_NAMES = ['Color', 'True color', 'True Color', 'Apparent color', 'Apparent Color'] as const
const TDS_NAMES = ['TDS', 'Total dissolved solids', 'Total Dissolved Solids'] as const

export type DiscolorationCheckKind = 'measurement' | 'guidance'

export type DiscolorationCheck = {
  id: string
  name: string
  kind: DiscolorationCheckKind
  available: boolean
  statusLead: string
  statusDetail: string | null
  latestYear: number | null
  latestRow: YearRow | null
  pack: AnalytePack | null
}

export const DISCOLORATION_COPY = {
  title: 'Discolored / brown or rusty water',
  subtitle: 'Water looks yellow, brown, reddish, or rust-colored.',
  takeaway:
    'Highlands Ranch Water says brown or rusty-colored water is commonly associated with the water heater when the issue occurs only with hot water. Sediment can also build up in household plumbing or water mains. The color alone does not identify a specific contaminant.',
  meaning: [
    'Highlands Ranch Water says brown or rusty-colored water is commonly associated with the water heater, especially when only the hot water is affected. The inside of an aging water-heater tank can begin to rust, and Highlands Ranch Water notes that hard water can shorten water-heater life.',
    'Sediment can also accumulate in plumbing and water mains. Highlands Ranch Water periodically flushes hydrants to remove buildup and sediment from the distribution system.',
    'The first useful question is whether the discoloration occurs in hot water, cold water, one faucet, or throughout the home.',
  ],
  checkedIntro:
    'Based on what you noticed, WaterLens looked for relevant measurements and official guidance.',
  dataNote:
    'WaterLens only shows information it can trace to an official source. It does not estimate missing measurements.',
  evidenceEmpty:
    'This extract does not include iron, manganese, color, turbidity, or TDS measurements that WaterLens can show here. The official guidance used on this page is listed under Sources and limitations.',
  regulatory:
    'EPA Secondary Drinking Water Standards are aesthetic, non-mandatory guidelines — not federal health-based primary MCLs. They can provide context for color, iron, manganese, and total dissolved solids. WaterLens does not compare a local value to those guidelines unless the matching measurement exists in the current official extract.',
  secondaryGuidelines: [
    {
      parameter: 'Color',
      value: '15 color units',
      label: 'EPA Secondary / Aesthetic Guideline',
    },
    {
      parameter: 'Iron',
      value: '0.3 mg/L',
      label: 'EPA Secondary / Aesthetic Guideline',
    },
    {
      parameter: 'Manganese',
      value: '0.05 mg/L',
      label: 'EPA Secondary / Aesthetic Guideline',
    },
    {
      parameter: 'Total dissolved solids (TDS)',
      value: '500 mg/L',
      label: 'EPA Secondary / Aesthetic Guideline',
    },
  ],
  regulatoryNote:
    'These guideline values are shown only as EPA aesthetic context. They are not compared to a WaterLens measurement when that parameter is not in the current dataset. Turbidity, when present, is a separate treatment-technique indicator — not one of these secondary aesthetic guidelines.',
  nextSteps: [
    {
      title: 'Check hot vs. cold',
      body: 'Run both hot and cold water separately. If only hot water is discolored, Highlands Ranch Water says brown or rusty hot water is commonly associated with the water heater. Consider having the water heater inspected by a qualified plumber.',
    },
    {
      title: 'Check more than one faucet',
      body: 'If only one faucet is affected, household plumbing or the fixture may be involved.',
    },
    {
      title: 'If cold water is also discolored',
      body: 'Run the cold water briefly and see whether it clears. If the discoloration persists, occurs throughout the home, or appears suddenly, contact Highlands Ranch Water.',
    },
    {
      title: 'If it is persistent, widespread, or unusual',
      body: 'Contact Highlands Ranch Water for guidance.',
    },
  ],
  sourcesIntro:
    'Information on this page is from Highlands Ranch Water, the U.S. EPA, and publicly available drinking-water data. This content is for educational purposes and does not replace advice from your water utility.',
  sourcesNote:
    'Water quality data and guidance may be updated over time. Always refer to the latest information from Highlands Ranch Water and the EPA.',
  limitation:
    'These results describe official public-water monitoring and general guidance. They do not test the water at your individual faucet. Household plumbing and water heaters can cause discoloration. Color alone does not identify a specific contaminant.',
  footerCitations: [
    { id: 'hrw_water_quality_faq', text: 'Highlands Ranch Water — Water Quality FAQs' },
    {
      id: 'epa_secondary_standards',
      text: 'EPA — Secondary Drinking Water Standards',
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

function guidanceCheck(id: string, name: string, statusLead: string): DiscolorationCheck {
  return {
    id,
    name,
    kind: 'guidance',
    available: true,
    statusLead,
    statusDetail: 'Source: Highlands Ranch Water',
    latestYear: null,
    latestRow: null,
    pack: null,
  }
}

function measurementCheck(
  id: string,
  displayName: string,
  pack: AnalytePack | null,
): DiscolorationCheck {
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
    statusDetail: `Latest available: ${row.year}`,
    latestYear: row.year,
    latestRow: row,
    pack,
  }
}

export function discolorationMeasurements(water: PwsPayload): DiscolorationCheck[] {
  return [
    measurementCheck('turbidity', 'Turbidity', findExact(water, TURBIDITY_NAME)),
    measurementCheck('iron', 'Iron', findFirst(water, IRON_NAMES)),
    measurementCheck('manganese', 'Manganese', findFirst(water, MANGANESE_NAMES)),
    measurementCheck('color', 'Color / true color', findFirst(water, COLOR_NAMES)),
    measurementCheck('tds', 'Total dissolved solids (TDS)', findFirst(water, TDS_NAMES)),
  ]
}

/** Transparency list: two official-guidance rows, then up to three inspected measurements. */
export function discolorationChecks(water: PwsPayload): DiscolorationCheck[] {
  const guidance = [
    guidanceCheck(
      'hrw_discoloration',
      'HRW discoloration guidance',
      'Official local guidance available',
    ),
    guidanceCheck(
      'hrw_sediment',
      'HRW sediment / hydrant-flushing guidance',
      'Official local guidance available',
    ),
  ]
  const measurements = discolorationMeasurements(water)
  const available = measurements.filter((item) => item.available)
  const unavailable = measurements.filter((item) => !item.available)
  const room = 5 - guidance.length
  return [...guidance, ...available, ...unavailable].slice(0, guidance.length + room)
}

export function discolorationEvidenceItems(water: PwsPayload): DiscolorationCheck[] {
  return discolorationMeasurements(water).filter(
    (item) => item.available && item.latestRow != null,
  )
}

export function formatMeasurement(row: YearRow): string {
  if (row.max_concentration == null) return '—'
  const n = row.max_concentration
  const formatted = Number.isInteger(n) ? String(n) : String(n)
  return `${formatted} ${row.unit ?? ''}`.trim()
}

export function measurementReferenceLabel(item: DiscolorationCheck): string {
  const row = item.latestRow
  if (!row) return 'No comparison value in this extract'
  if (item.id === 'turbidity') {
    if (row.sdwa_limit != null) {
      return `Federal reference line in this extract: ${row.sdwa_limit} ${row.unit ?? 'NTU'} — treatment-technique context, not a compliance verdict`.trim()
    }
    return 'No comparison value in this extract'
  }
  if (row.sdwa_limit != null) {
    return `Comparison value in this extract: ${row.sdwa_limit} ${row.unit ?? ''}`.trim()
  }
  return 'No comparison value in this extract'
}

export function discolorationDataThroughYear(water: PwsPayload): number | null {
  const years = discolorationEvidenceItems(water)
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
