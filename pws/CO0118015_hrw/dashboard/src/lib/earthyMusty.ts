import { latestRowForAnalyte } from './derive'
import type { SourceId } from './sourceRegistry'
import type { AnalytePack, PwsPayload } from '../types/water'

const ODOR_NAMES = ['Odor', 'Threshold Odor Number', 'TON', 'Taste and odor'] as const
const ALGAE_NAMES = [
  'Geosmin',
  'MIB',
  '2-Methylisoborneol',
  'Algae',
  'Total organic carbon',
  'TOC',
  'Organic carbon',
] as const

export type EarthyCheckKind = 'measurement' | 'guidance'

export type EarthyCheck = {
  id: string
  name: string
  kind: EarthyCheckKind
  available: boolean
  statusLead: string
  statusDetail: string | null
  latestYear: number | null
  pack: AnalytePack | null
}

export const EARTHY_COPY = {
  title: 'Earthy / musty smell',
  subtitle: 'Smells earthy, musty, or like soil.',
  takeaway:
    'Highlands Ranch Water notes that earthy, musty, or moldy tastes and odors can occur seasonally when organic material such as algae or plants is more prevalent in lakes, reservoirs, and canals. Treatment removes the material, but some odor-causing compounds may still be noticeable. A noticeable earthy or musty smell does not by itself identify a harmful contaminant.',
  meaning: [
    'Earthy or musty tastes and odors can occur when naturally occurring organic material is present in source water. Highlands Ranch Water notes that these conditions may be more noticeable seasonally.',
    'People also vary in how sensitive they are to taste and odor. Sometimes the odor may come from the sink drain rather than the water itself.',
    'To check, put a small amount of water in a clean glass, move away from the sink, swirl the water, and smell it. If the water itself has no odor, the sink drain or plumbing may be the source.',
  ],
  checkedIntro:
    'Based on what you noticed, WaterLens looked for relevant measurements and official guidance.',
  dataNote:
    'WaterLens only shows information it can trace to an official source. It does not estimate missing measurements.',
  evidenceEmpty:
    'This extract does not include an odor measurement, geosmin, MIB, or another algae/odor-compound result. The official guidance WaterLens used is listed under Sources and limitations.',
  regulatory:
    'EPA Secondary Drinking Water Standards include taste and odor as aesthetic, non-mandatory guidance — not a health-based Maximum Contaminant Level (MCL). A Threshold Odor Number, if used, is a laboratory measure. A resident’s smell cannot be converted into that regulatory measurement without testing.',
  nextSteps: [
    {
      title: 'Check whether the odor is in the water or the sink',
      body: 'Put water in a clean glass, move away from the sink, swirl it, and smell it.',
    },
    {
      title: 'Try cold water',
      body: 'Use cold water for drinking and cooking and see whether the odor changes.',
    },
    {
      title: 'Check more than one faucet',
      body: 'If only one faucet is affected, the source may be household plumbing or the drain rather than the public water supply.',
    },
    {
      title: 'If the odor is strong, sudden, or persistent',
      body: 'Contact Highlands Ranch Water for guidance.',
    },
  ],
  sourcesIntro:
    'Information on this page is from Highlands Ranch Water and the U.S. EPA. This content is for educational purposes and does not replace advice from your water utility.',
  sourcesNote:
    'Water quality data and guidance may be updated over time. Always refer to the latest information from Highlands Ranch Water and the EPA.',
  limitation:
    'These results describe official public water information and general guidance. They do not test the water at your individual faucet. Household plumbing, drains, and individual sensitivity can affect taste and odor. Smell alone does not identify a specific contaminant.',
  footerCitations: [
    { id: 'hrw_water_quality_faq', text: 'Highlands Ranch Water — Water Quality FAQs' },
    { id: 'hrw_water_treatment', text: 'Highlands Ranch Water — Water Treatment' },
    {
      id: 'epa_secondary_standards',
      text: 'EPA — Secondary Drinking Water Standards (aesthetic taste and odor guidance)',
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
): EarthyCheck {
  if (!isUsable(pack)) {
    return {
      id,
      name: displayName,
      kind: 'measurement',
      available: false,
      statusLead: 'Not available in the current WaterLens dataset',
      statusDetail: null,
      latestYear: null,
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
    pack,
  }
}

export function earthyChecks(water: PwsPayload): EarthyCheck[] {
  return [
    {
      id: 'hrw_guidance',
      name: 'HRW taste & odor guidance',
      kind: 'guidance',
      available: true,
      statusLead: 'Official local guidance available',
      statusDetail: 'Source: Highlands Ranch Water',
      latestYear: null,
      pack: null,
    },
    {
      id: 'source_treatment',
      name: 'Source-water / treatment context',
      kind: 'guidance',
      available: true,
      statusLead: 'Official Highlands Ranch Water information available',
      statusDetail: 'Source: Highlands Ranch Water',
      latestYear: null,
      pack: null,
    },
    measurementCheck('odor', 'Odor measurement', findFirst(water, ODOR_NAMES)),
    measurementCheck(
      'algae',
      'Algae / odor compound measurement',
      findFirst(water, ALGAE_NAMES),
    ),
  ]
}

export function earthyEvidenceItems(checks: EarthyCheck[]): EarthyCheck[] {
  return checks.filter((item) => item.kind === 'measurement' && item.available)
}

export function earthyDataThroughYear(checks: EarthyCheck[]): number | null {
  const years = earthyEvidenceItems(checks)
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
