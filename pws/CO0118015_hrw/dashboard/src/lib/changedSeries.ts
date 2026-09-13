import {
  COPPER_REGULATION,
  HRW_COPPER_LCR_PERIODS,
} from '../data/hrwCopperLcr.ts'
import { HRW_LEAD_LCR_PERIODS, LEAD_REGULATION } from '../data/hrwLeadLcr.ts'
import { HRW_LITHIUM_UCMR_YEARS } from '../data/hrwLithiumUcmr.ts'
import { hrwPfasById, type HrwPfasCompound } from '../data/hrwPfas2024.ts'
import type { AnalytePack, YearRow } from '../types/water.ts'

/** Short series or a different sampling rule — keep off the long CDPHE shelf. */
export const NEWER_OR_DIFFERENT_TEST_NAMES = new Set([
  'Copper',
  'Lead',
  'Lithium',
  'PFOA',
  'PFOS',
  'PFHxS',
  'PFNA',
  'PFBS',
  'Turbidity',
])

const PFAS_NAMES = new Set(['PFOA', 'PFOS', 'PFHxS', 'PFNA', 'PFBS'])
const PFAS_YEARS = [2024, 2025] as const

function withYears(pack: AnalytePack, rows: YearRow[]): AnalytePack {
  const by_year = [...rows].sort((a, b) => a.year - b.year)
  const last = by_year[by_year.length - 1]
  return {
    analyte_name: pack.analyte_name,
    summary_latest_year: last?.year ?? pack.summary_latest_year,
    by_year,
  }
}

function yearlyMax<T extends { year: number }>(
  rows: readonly T[],
  valueOf: (row: T) => number,
): { year: number; value: number }[] {
  const highs = new Map<number, number>()
  for (const row of rows) {
    const value = valueOf(row)
    const prev = highs.get(row.year)
    highs.set(row.year, prev == null ? value : Math.max(prev, value))
  }
  return [...highs.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, value]) => ({ year, value }))
}

function actionLevelCategory(value: number, limit: number): string {
  return value > limit ? 'Above action level' : 'Below action level'
}

function overlayCopper(pack: AnalytePack): AnalytePack {
  const limit = COPPER_REGULATION.currentActionLevelPpm
  return withYears(
    pack,
    yearlyMax(HRW_COPPER_LCR_PERIODS, (row) => row.percentile90Ppm).map(
      ({ year, value }) => ({
      year,
      max_concentration: value,
      avg_concentration: value,
      sdwa_limit: limit,
      unit: 'mg/L',
      score_available: false,
      score_reason: 'lead_copper_action_level',
      over_limit: value > limit,
      category: actionLevelCategory(value, limit),
    }),
    ),
  )
}

function overlayLead(pack: AnalytePack): AnalytePack {
  const limit = LEAD_REGULATION.currentActionLevelPpb
  return withYears(
    pack,
    yearlyMax(HRW_LEAD_LCR_PERIODS, (row) => row.percentile90Ppb).map(
      ({ year, value }) => ({
      year,
      max_concentration: value,
      avg_concentration: value,
      sdwa_limit: limit,
      unit: 'ug/L',
      score_available: false,
      score_reason: 'lead_copper_action_level',
      over_limit: value > limit,
      category: actionLevelCategory(value, limit),
    }),
    ),
  )
}

function overlayLithium(pack: AnalytePack): AnalytePack {
  return withYears(
    pack,
    HRW_LITHIUM_UCMR_YEARS.map((row) => ({
      year: row.year,
      max_concentration: row.averagePpb,
      avg_concentration: row.averagePpb,
      sdwa_limit: null,
      unit: 'ug/L',
      score_available: false,
      over_limit: false,
      category: 'No federal limit',
    })),
  )
}

function pfasCategory(src: HrwPfasCompound): string {
  if (src.belowReportingLevel || src.averagePpt == null) {
    return 'Below reporting level'
  }
  if (src.individualMclPpt == null) return 'No individual limit'
  if (src.averagePpt > src.individualMclPpt) return 'Above Limit'
  return 'Below Limit'
}

function overlayPfas(pack: AnalytePack): AnalytePack {
  const rows: YearRow[] = []
  for (const year of PFAS_YEARS) {
    const src = hrwPfasById(pack.analyte_name, year)
    if (!src) continue
    const value = src.belowReportingLevel ? null : src.averagePpt
    const limit = src.individualMclPpt
    rows.push({
      year,
      max_concentration: value,
      avg_concentration: value,
      sdwa_limit: limit,
      unit: 'ng/L',
      score_available: false,
      over_limit:
        value != null && limit != null ? value > limit : false,
      category: pfasCategory(src),
    })
  }
  return rows.length > 0 ? withYears(pack, rows) : pack
}

/** Replace stale extract years with official HRW sidecar series where we have them. */
export function overlayOfficialChangedSeries(analytes: AnalytePack[]): AnalytePack[] {
  return analytes.map((pack) => {
    if (pack.analyte_name === 'Copper') return overlayCopper(pack)
    if (pack.analyte_name === 'Lead') return overlayLead(pack)
    if (pack.analyte_name === 'Lithium') return overlayLithium(pack)
    if (PFAS_NAMES.has(pack.analyte_name)) return overlayPfas(pack)
    return pack
  })
}

export function splitChangedAnalytes(analytes: AnalytePack[]): {
  comparable: AnalytePack[]
  newerProgram: AnalytePack[]
} {
  const comparable: AnalytePack[] = []
  const newerProgram: AnalytePack[] = []
  for (const pack of analytes) {
    if (NEWER_OR_DIFFERENT_TEST_NAMES.has(pack.analyte_name)) {
      newerProgram.push(pack)
    } else if (pack.by_year.length > 0) {
      comparable.push(pack)
    }
  }
  return { comparable, newerProgram }
}
