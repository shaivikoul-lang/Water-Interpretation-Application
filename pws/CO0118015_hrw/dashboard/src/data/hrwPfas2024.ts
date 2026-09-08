import type { SourceId } from '../lib/sourceRegistry'

/** Official Highlands Ranch Water PFAS monitoring from annual water-quality reports. */
export type PfasResultKind = 'average' | 'range_high' | 'brl'

export const HRW_PFAS_PROGRAM = 'hrw_official_pfas_monitoring' as const
export const HRW_PFAS_LATEST_YEAR = 2025 as const

export type HrwPfasCompound = {
  id: string
  name: string
  unit: 'ppt'
  sampleSize: number
  year: 2024 | 2025
  averagePpt: number | null
  rangeLowPpt: number | null
  rangeHighPpt: number | null
  belowReportingLevel: boolean
  individualMclPpt: number | null
  program: typeof HRW_PFAS_PROGRAM
}

export const HRW_PFAS_2024_META = {
  program: HRW_PFAS_PROGRAM,
  programLabel: 'Highlands Ranch Water 2024 PFAS monitoring',
  year: 2024 as const,
  unit: 'ppt' as const,
  sourceId: 'hrw_2025_ccr' as SourceId,
  note: 'Official HRW 2024 PFAS table from the 2025 Water Quality Report. Not mixed with CDPHE yearly summaries.',
} as const

export const HRW_PFAS_2025_META = {
  program: HRW_PFAS_PROGRAM,
  programLabel: 'Highlands Ranch Water 2025 PFAS monitoring',
  year: 2025 as const,
  unit: 'ppt' as const,
  sourceId: 'hrw_2026_ccr' as SourceId,
  note: 'Official HRW 2025 PFAS table from the 2026 Water Quality Report. The report table lists year 2025. A leftover sentence in that PDF still says samples were collected in 2024.',
} as const

export const HRW_PFAS_LATEST_META = HRW_PFAS_2025_META

function row(
  year: 2024 | 2025,
  sampleSize: number,
  partial: Omit<HrwPfasCompound, 'unit' | 'year' | 'sampleSize' | 'program'>,
): HrwPfasCompound {
  return {
    ...partial,
    unit: 'ppt',
    year,
    sampleSize,
    program: HRW_PFAS_PROGRAM,
  }
}

export const HRW_PFAS_2024: readonly HrwPfasCompound[] = [
  row(2024, 16, {
    id: 'PFOA',
    name: 'PFOA',
    averagePpt: 0.48,
    rangeLowPpt: null,
    rangeHighPpt: 2.9,
    belowReportingLevel: false,
    individualMclPpt: 4.0,
  }),
  row(2024, 16, {
    id: 'PFOS',
    name: 'PFOS',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 4.0,
  }),
  row(2024, 16, {
    id: 'PFHxS',
    name: 'PFHxS',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 10.0,
  }),
  row(2024, 16, {
    id: 'PFNA',
    name: 'PFNA',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 10.0,
  }),
  row(2024, 16, {
    id: 'PFBS',
    name: 'PFBS',
    averagePpt: 2.94,
    rangeLowPpt: null,
    rangeHighPpt: 5.9,
    belowReportingLevel: false,
    individualMclPpt: null,
  }),
  row(2024, 16, {
    id: 'HFPO-DA',
    name: 'HFPO-DA / GenX',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 10.0,
  }),
]

export const HRW_PFAS_2025: readonly HrwPfasCompound[] = [
  row(2025, 12, {
    id: 'PFOA',
    name: 'PFOA',
    averagePpt: 0.61,
    rangeLowPpt: null,
    rangeHighPpt: 2.7,
    belowReportingLevel: false,
    individualMclPpt: 4.0,
  }),
  row(2025, 12, {
    id: 'PFOS',
    name: 'PFOS',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 4.0,
  }),
  row(2025, 12, {
    id: 'PFHxS',
    name: 'PFHxS',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 10.0,
  }),
  row(2025, 12, {
    id: 'PFNA',
    name: 'PFNA',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 10.0,
  }),
  row(2025, 12, {
    id: 'PFBS',
    name: 'PFBS',
    averagePpt: 3.72,
    rangeLowPpt: null,
    rangeHighPpt: 6.4,
    belowReportingLevel: false,
    individualMclPpt: null,
  }),
  row(2025, 12, {
    id: 'HFPO-DA',
    name: 'HFPO-DA / GenX',
    averagePpt: null,
    rangeLowPpt: null,
    rangeHighPpt: null,
    belowReportingLevel: true,
    individualMclPpt: 10.0,
  }),
]

export const HRW_PFAS_LATEST = HRW_PFAS_2025

export function hrwPfasByYear(year: 2024 | 2025): readonly HrwPfasCompound[] {
  return year === 2025 ? HRW_PFAS_2025 : HRW_PFAS_2024
}

export function hrwPfasById(
  id: string,
  year: 2024 | 2025 = HRW_PFAS_LATEST_YEAR,
): HrwPfasCompound | undefined {
  return hrwPfasByYear(year).find((c) => c.id === id)
}

export function hrwPfoaOfficialYears(): HrwPfasCompound[] {
  return [hrwPfasById('PFOA', 2024), hrwPfasById('PFOA', 2025)].filter(
    (row): row is HrwPfasCompound => row != null && row.averagePpt != null,
  )
}
