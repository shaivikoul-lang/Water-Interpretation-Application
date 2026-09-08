import { latestRowForAnalyte } from './derive'
import type { SourceId } from './sourceRegistry'
import type { AnalytePack, PwsPayload, YearRow } from '../types/water'

/** Exact names only — a substring match would false-hit PFAS names containing “ph”. */
const METALLIC_CANDIDATES = ['Copper', 'Lead', 'Iron', 'Manganese'] as const

export type MetallicCheck = {
  name: string
  available: boolean
  latestYear: number | null
  latestRow: YearRow | null
  pack: AnalytePack | null
}

export const METALLIC_COPY = {
  title: 'Metallic taste',
  subtitle: 'Tastes like metal, iron, or pennies.',
  takeaway:
    'A metallic taste can have several causes, including minerals, source-water changes, or household plumbing. A noticeable metallic taste does not by itself identify a specific contaminant.',
  meaning: [
    'Highlands Ranch Water notes that metallic taste is commonly associated with minerals such as iron or copper, and may also be noticed when groundwater sources are blended with treated surface water because groundwater can contain different mineral levels.',
    'Metallic taste can also be influenced by plumbing materials in your home. Only laboratory testing can confirm which metals, if any, are present.',
  ],
  meaningSources: ['hrw_water_quality_faq', 'epa_secondary_standards'] as const satisfies readonly SourceId[],
  checkedIntro:
    'We looked at the parameters most commonly associated with metallic taste in your public water data from CDPHE.',
  dataNote:
    'WaterLens only shows measurements it can trace to an official source. It does not estimate missing values.',
  nextSteps: [
    {
      title: 'Try flushing your tap',
      body: 'Run cold water for a few minutes, especially if the water has not been used for several hours.',
    },
    {
      title: 'Use only the cold water tap for drinking and cooking',
      body: 'Hot water can interact with plumbing materials and sometimes taste metallic.',
    },
    {
      title: 'Check if the taste is only in your home',
      body: 'If other homes in your area do not notice the same taste, it may be related to household plumbing.',
    },
    {
      title: 'If the taste persists, contact Highlands Ranch Water',
      body: 'They can help evaluate your specific situation and may suggest additional steps or recommend testing.',
    },
  ],
  limitation:
    'This information is from official, publicly available sources. It may not include all possible causes of taste or address conditions in your home plumbing.',
  footerCitations: [
    {
      id: 'hrw_water_quality_faq',
      text: 'Highlands Ranch Water – Water Quality FAQs (Taste and Odor)',
    },
    {
      id: 'epa_secondary_standards',
      text: 'U.S. EPA – Secondary Drinking Water Standards (Nuisance Chemicals)',
    },
  ] as const satisfies readonly { id: SourceId; text: string }[],
} as const

function findExact(water: PwsPayload, name: string): AnalytePack | null {
  return water.analytes.find((a) => a.analyte_name === name) ?? null
}

function isUsable(pack: AnalytePack | null): pack is AnalytePack {
  return !!pack && pack.by_year.length > 0 && latestRowForAnalyte(pack) != null
}

/** Status list for “What did WaterLens check?” — availability comes from the extract. */
export function metallicChecks(water: PwsPayload): MetallicCheck[] {
  return METALLIC_CANDIDATES.map((name) => {
    const pack = findExact(water, name)
    if (!isUsable(pack)) {
      return { name, available: false, latestYear: null, latestRow: null, pack: null }
    }
    const row = latestRowForAnalyte(pack)!
    return {
      name,
      available: true,
      latestYear: row.year,
      latestRow: row,
      pack,
    }
  })
}

export function formatMeasurement(row: YearRow): string {
  if (row.max_concentration == null) return '—'
  const n = row.max_concentration
  const formatted = Number.isInteger(n) ? String(n) : String(n)
  return `${formatted} ${row.unit ?? ''}`.trim()
}

/** How the comparison number should be described — never “safe limit.” */
export function referenceLabel(row: YearRow): string {
  if (row.score_reason === 'lead_copper_action_level' && row.sdwa_limit != null) {
    return `Action-level reference in this dataset: ${row.sdwa_limit} ${row.unit ?? ''}`.trim()
  }
  if (row.sdwa_limit != null) {
    return `Comparison value in this dataset: ${row.sdwa_limit} ${row.unit ?? ''}`.trim()
  }
  return 'No comparison value in this extract'
}

/** Latest year among parameters WaterLens actually has for this topic. */
export function metallicDataThroughYear(checks: MetallicCheck[]): number | null {
  const years = checks.filter((c) => c.available && c.latestYear != null).map((c) => c.latestYear!)
  if (!years.length) return null
  return Math.max(...years)
}

export function dataSourceLabel(water: PwsPayload): string {
  const source = water.source?.trim()
  const dataset = water.dataset?.trim()
  if (source && dataset) return `${source} — ${dataset}`
  return source || dataset || 'Official public monitoring extract for this water system'
}
