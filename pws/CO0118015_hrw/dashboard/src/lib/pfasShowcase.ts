import {
  hrwPfasById,
  hrwPfoaOfficialYears,
  HRW_PFAS_2024,
  HRW_PFAS_2024_META,
  HRW_PFAS_2025_META,
  HRW_PFAS_LATEST,
  HRW_PFAS_LATEST_META,
  type HrwPfasCompound,
} from '../data/hrwPfas2024'
import type { SourceId } from './sourceRegistry'
import type { AnalytePack, PwsPayload, YearRow } from '../types/water'

export const PFAS_VIDEO = {
  watchUrl: 'https://youtu.be/k4cSgY_CP1A?si=8299Nw35cZ8Mu5fG',
  embedUrl: 'https://www.youtube.com/embed/k4cSgY_CP1A?si=8299Nw35cZ8Mu5fG',
  label: 'Watch: PFAS explained',
  duration: '2:48',
} as const

export const PFOA_MCL_PPT = 4.0
export const PFOS_MCL_PPT = 4.0

export const BRL_HELP =
  'Below reporting level means the laboratory did not report a quantifiable concentration above its reporting threshold. It does not necessarily mean the substance is absolutely absent.'

export const UNDER_REVIEW_IDS = new Set(['PFHxS', 'PFNA', 'HFPO-DA'])

export type PfasCompoundExplain = {
  fullName: string
  meaning: string
  carbons: number | null
  chainLabel: string
}

/** Official names and resident-facing meaning. Not measurements. */
export const PFAS_COMPOUND_EXPLAIN: Record<string, PfasCompoundExplain> = {
  PFOA: {
    fullName: 'Perfluorooctanoic acid',
    meaning: 'One type of PFAS.',
    carbons: 8,
    chainLabel: 'Eight-carbon PFAS',
  },
  PFOS: {
    fullName: 'Perfluorooctane sulfonic acid',
    meaning: 'Another type of PFAS. It has a current federal drinking-water limit of 4.0 ppt.',
    carbons: 8,
    chainLabel: 'Eight-carbon PFAS',
  },
  PFHxS: {
    fullName: 'Perfluorohexane sulfonic acid',
    meaning:
      'This table does not give PFHxS its own 4 ppt cap. That does not mean the result failed. This one was below the reporting level.',
    carbons: 6,
    chainLabel: 'Six-carbon PFAS',
  },
  PFNA: {
    fullName: 'Perfluorononanoic acid',
    meaning:
      'This table does not give PFNA its own 4 ppt cap. That does not mean the result failed. This one was below the reporting level.',
    carbons: 9,
    chainLabel: 'Nine-carbon PFAS',
  },
  PFBS: {
    fullName: 'Perfluorobutane sulfonic acid',
    meaning:
      'This table does not give PFBS its own 4 ppt cap, so WaterLens cannot mark it pass or fail the way it marks PFOA. That is not the same as a failed test.',
    carbons: 4,
    chainLabel: 'Four-carbon PFAS',
  },
  'HFPO-DA': {
    fullName: 'Hexafluoropropylene oxide dimer acid (GenX)',
    meaning:
      'This table does not give GenX its own 4 ppt cap. That does not mean the result failed. This one was below the reporting level.',
    carbons: null,
    chainLabel: 'Replacement PFAS (GenX)',
  },
}

export function formatPpt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export function formatExtractDate(iso: string | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export type TrendKind = 'increasing' | 'decreasing' | 'stable' | 'insufficient_data'

export type TrendResult = {
  kind: TrendKind
  changePct: number | null
  message: string
}

export type ChartPoint = {
  year: number
  value: number
  series: 'average' | 'max'
  compound: string
  program: string
  programLabel: string
  programShort: string
  unit: string
  sourceId: SourceId
}

export function percentOfMcl(value: number, mcl: number): number {
  if (mcl <= 0) return 0
  return value / mcl
}

export function percentOfMclRounded(value: number, mcl: number): number {
  return Math.round(percentOfMcl(value, mcl) * 100)
}

export function deriveTrend(points: ChartPoint[]): TrendResult {
  const byProgram = new Map<string, ChartPoint[]>()
  for (const p of points) {
    const list = byProgram.get(p.program) ?? []
    list.push(p)
    byProgram.set(p.program, list)
  }
  const comparable = [...byProgram.values()].find((list) => {
    const years = new Set(list.map((p) => p.year))
    return years.size >= 2
  })
  if (!comparable) {
    return {
      kind: 'insufficient_data',
      changePct: null,
      message:
        'Not enough comparable measurements are available to determine a trend. Official Highlands Ranch Water tables and the CDPHE yearly summary come from different sampling programs and are not combined into one trend.',
    }
  }
  const sorted = [...comparable].sort((a, b) => a.year - b.year)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (first.value === 0) {
    return { kind: 'insufficient_data', changePct: null, message: 'Not enough comparable measurements are available to determine a trend.' }
  }
  const change = (last.value - first.value) / first.value
  const changePct = Math.round(change * 100)
  if (Math.abs(change) < 0.08) {
    return {
      kind: 'stable',
      changePct,
      message: 'Available measurements have remained relatively stable.',
    }
  }
  if (change < 0) {
    return {
      kind: 'decreasing',
      changePct,
      message: 'Recent measurements are lower than the earliest available measurements in this comparable set.',
    }
  }
  return {
    kind: 'increasing',
    changePct,
    message: 'Recent measurements are higher than the earliest available measurements in this comparable set.',
  }
}

export function pfoaComparison() {
  const pfoa = hrwPfasById('PFOA')!
  const avg = pfoa.averagePpt!
  const high = pfoa.rangeHighPpt!
  const mcl = pfoa.individualMclPpt!
  return {
    year: pfoa.year,
    sampleSize: pfoa.sampleSize,
    unit: pfoa.unit,
    averagePpt: avg,
    highestPpt: high,
    mclPpt: mcl,
    averageShare: percentOfMcl(avg, mcl),
    averageSharePct: percentOfMclRounded(avg, mcl),
    highestShare: percentOfMcl(high, mcl),
    highestSharePct: percentOfMclRounded(high, mcl),
    programLabel: HRW_PFAS_LATEST_META.programLabel,
    sourceId: HRW_PFAS_LATEST_META.sourceId,
  }
}

export function takeawayText() {
  const c = pfoaComparison()
  return `Highlands Ranch Water’s ${c.year} PFAS monitoring reported an average PFOA level of ${c.averagePpt} ppt, below EPA’s current ${c.mclPpt} ppt PFOA MCL. The highest reported PFOA result in the ${c.year} monitoring range was ${c.highestPpt} ppt. PFOS, PFHxS, PFNA, and HFPO-DA were reported below the laboratory reporting level in this monitoring set.`
}

export function complianceNote() {
  const c = pfoaComparison()
  return `The highest reported ${c.year} PFOA sample was ${c.highestPpt} ppt, which is about ${c.highestSharePct}% of the ${c.mclPpt} ppt federal MCL. Compliance determinations use the applicable regulatory monitoring method rather than a single sample.`
}

function findPack(water: PwsPayload, name: string): AnalytePack | null {
  return water.analytes.find((a) => a.analyte_name === name) ?? null
}

function pptFromRow(row: YearRow): { avg: number | null; max: number | null; unit: string } {
  const unit = row.unit === 'ng/L' || row.unit === 'ppt' ? 'ppt' : (row.unit ?? 'ppt')
  return {
    avg: row.avg_concentration ?? null,
    max: row.max_concentration ?? null,
    unit,
  }
}

export function cdphePfasHistory(water: PwsPayload, compound: 'PFOA' | 'PFOS'): ChartPoint[] {
  const pack = findPack(water, compound)
  if (!pack) return []
  const points: ChartPoint[] = []
  for (const row of pack.by_year) {
    const { avg, max, unit } = pptFromRow(row)
    if (avg != null) {
      points.push({
        year: row.year,
        value: avg,
        series: 'average',
        compound,
        program: 'cdphe_yearly_summary',
        programLabel: 'CDPHE yearly summary (average)',
        programShort: 'CDPHE 2025 summary',
        unit,
        sourceId: 'cdphe_hrw_monitoring',
      })
    }
    if (max != null) {
      points.push({
        year: row.year,
        value: max,
        series: 'max',
        compound,
        program: 'cdphe_yearly_summary_max',
        programLabel: 'CDPHE yearly summary (year maximum)',
        programShort: 'CDPHE 2025 summary',
        unit,
        sourceId: 'cdphe_hrw_monitoring',
      })
    }
  }
  return points
}

export function hrwChartPoints(compound: 'PFOA' | 'PFOS'): ChartPoint[] {
  const years =
    compound === 'PFOA'
      ? hrwPfoaOfficialYears()
      : [hrwPfasById(compound)].filter((row): row is HrwPfasCompound => row != null)
  const points: ChartPoint[] = []
  for (const row of years) {
    if (!row || row.belowReportingLevel || row.averagePpt == null) continue
    const meta = row.year === 2025 ? HRW_PFAS_2025_META : HRW_PFAS_2024_META
    points.push({
      year: row.year,
      value: row.averagePpt,
      series: 'average',
      compound,
      program: row.program,
      programLabel: meta.programLabel + ' (average)',
      programShort: `HRW ${row.year} monitoring`,
      unit: row.unit,
      sourceId: meta.sourceId,
    })
    if (row.rangeHighPpt != null) {
      points.push({
        year: row.year,
        value: row.rangeHighPpt,
        series: 'max',
        compound,
        program: `${row.program}_max`,
        programLabel: meta.programLabel + ' (highest sample)',
        programShort: `HRW ${row.year} monitoring`,
        unit: row.unit,
        sourceId: meta.sourceId,
      })
    }
  }
  return points
}

export function chartSeries(water: PwsPayload, compound: 'PFOA' | 'PFOS'): ChartPoint[] {
  return [...hrwChartPoints(compound), ...cdphePfasHistory(water, compound)]
}

export function chartYears(points: ChartPoint[]): number[] {
  return [...new Set(points.map((p) => p.year))].sort((a, b) => a - b)
}

export type SummaryField = {
  label: string
  value: string
}

export function compoundDataSummary(water: PwsPayload, compound: 'PFOA' | 'PFOS') {
  const hrw = hrwPfasById(compound)
  const cdphe = cdphePfasHistory(water, compound)
  const cdpheAvg = cdphe.find((p) => p.series === 'average')
  const cdpheMax = cdphe.find((p) => p.series === 'max')
  const fields: SummaryField[] = []

  if (compound === 'PFOA' && hrw?.averagePpt != null) {
    fields.push({
      label: 'Latest available value',
      value: `${formatPpt(hrw.averagePpt)} ppt — ${HRW_PFAS_LATEST_META.programLabel} average`,
    })
  } else if (hrw?.belowReportingLevel) {
    fields.push({
      label: 'Latest available value',
      value: `Below reporting level — ${HRW_PFAS_LATEST_META.programLabel}`,
    })
  }

  if (compound === 'PFOA' && hrw?.rangeHighPpt != null) {
    fields.push({
      label: 'Highest available value',
      value: `${formatPpt(hrw.rangeHighPpt)} ppt — highest reported ${hrw.year} HRW PFOA sample`,
    })
  }

  fields.push({
    label: 'Data period',
    value: 'HRW official PFAS monitoring years 2024–2025; CDPHE yearly summary latest year 2025',
  })

  const cdpheNote =
    cdpheAvg != null
      ? `CDPHE 2025 yearly summary (separate program): average ${formatPpt(cdpheAvg.value)} ppt` +
        (cdpheMax != null ? `, year maximum ${formatPpt(cdpheMax.value)} ppt` : '') +
        '. This is not treated as a third year of the official Highlands Ranch Water PFAS table.'
      : null

  return {
    fields,
    previousComparable: null as SummaryField | null,
    change: null as SummaryField | null,
    lowest: null as SummaryField | null,
    cdpheNote,
    changeHiddenReason:
      'The official Highlands Ranch Water 2024 and 2025 PFOA averages are comparable. The CDPHE yearly summary is a different test and is not combined with them.',
  }
}

/** True only when a current individual MCL exists and reported values sit under it. */
export function withinCurrentFederalLimit(compound: HrwPfasCompound): boolean {
  if (UNDER_REVIEW_IDS.has(compound.id)) return false
  if (compound.belowReportingLevel) return false
  const mcl = compound.individualMclPpt
  if (mcl == null) return false
  const values = [compound.averagePpt, compound.rangeHighPpt].filter((n): n is number => n != null)
  return values.length > 0 && values.every((n) => n < mcl)
}

export function compoundResidentResult(compound: HrwPfasCompound) {
  if (compound.belowReportingLevel) {
    return {
      result: 'Below the laboratory’s reporting level',
      detail: 'Technical term: below reporting level (BRL). This should not be read as zero.',
    }
  }
  const parts: string[] = []
  if (compound.averagePpt != null) {
    parts.push(`${formatPpt(compound.averagePpt)} ppt average`)
  }
  if (compound.rangeHighPpt != null) {
    parts.push(`highest reported sample ${formatPpt(compound.rangeHighPpt)} ppt`)
  }
  const result = parts.join('; ')
  const detail =
    compound.individualMclPpt != null
      ? `Federal drinking-water limit: ${formatPpt(compound.individualMclPpt)} ppt`
      : 'This table does not give this compound its own 4 ppt limit. That is not a fail.'
  return { result, detail }
}

export {
  HRW_PFAS_2024,
  HRW_PFAS_2024_META,
  HRW_PFAS_2025_META,
  HRW_PFAS_LATEST,
  HRW_PFAS_LATEST_META,
  hrwPfoaOfficialYears,
}
