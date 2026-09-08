import { EPA_TDS_SMCL_MG_L, HRW_TDS_2025, hrwTdsStats } from './hrwTds2025.ts'

export type TdsWaterType = 'tap' | 'ro'

export type TdsHrwRelation = 'below' | 'within' | 'above'
export type TdsEpaRelation = 'below' | 'at' | 'above'

export type TdsInterpretation = {
  valid: true
  reading: number
  displayReading: string
  unit: 'ppm'
  waterType: TdsWaterType
  hrwMin: number
  hrwMax: number
  hrwMean: number
  hrwMedian: number
  hrwLatest: number
  hrwLatestQuarter: number
  epaSmcl: number
  vsHrw: TdsHrwRelation
  vsEpa: TdsEpaRelation
  headline: string
  hrwNarrative: string
  epaNarrative: string
  roNarrative: string | null
  escalate: boolean
  sourceYear: number
  sourceUnit: string
}

export type TdsInvalid = {
  valid: false
  error: string
}

export type TdsResult = TdsInterpretation | TdsInvalid

export const TDS_INPUT_MAX = 5000

export const TDS_COPY = {
  title: 'My test reading',
  subtitle: 'Enter a home TDS meter reading to understand it in context.',
  inputLead:
    'Enter the value from your home meter. WaterLens will help you understand how it compares with official Highlands Ranch Water measurements and EPA aesthetic guidance — and what TDS can and cannot tell you.',
  about:
    'Home TDS meters are useful for a snapshot, but they are not the same as a utility laboratory result. Precision and calibration vary by device, so treat a single home reading as a starting point rather than a definitive measurement.',
  tells:
    'TDS estimates the overall amount of dissolved material in water. Changes in TDS can affect characteristics such as taste, mineral deposits, and scale. It is an aggregate measurement, not a list of individual substances.',
  cannotLead: 'TDS does not identify which substances are dissolved in the water.',
  cannotItems: ['PFAS', 'Lead', 'Arsenic', 'A specific individual contaminant'] as const,
  cannotClose: 'A lower TDS number does not automatically mean safer water.',
  checkedNote:
    'WaterLens compares your reading with traceable official information. It does not estimate contaminants your meter cannot measure.',
  nextTap: [
    {
      title: 'Repeat the measurement if it seems surprising',
      body: 'A second reading on the same faucet helps you see whether the first number was a one-time result.',
    },
    {
      title: 'Follow the meter manufacturer’s instructions',
      body: 'Rinse the probe or cup as directed and wait for the reading to settle before you record it.',
    },
    {
      title: 'Compare more than one faucet if useful',
      body: 'Kitchen, bathroom, and outdoor taps can differ. Comparing them can show whether the result is widespread in the home.',
    },
    {
      title: 'Use this explanation rather than treating TDS as a contaminant test',
      body: 'TDS is an aggregate reading. It cannot confirm or rule out PFAS, lead, arsenic, or another specific contaminant.',
    },
  ],
  nextRo: [
    {
      title: 'A much lower TDS after reverse osmosis is expected',
      body: 'RO is designed to reduce dissolved ions, so the filtered reading is not supposed to match tap-water averages.',
    },
    {
      title: 'Repeat the measurement if it seems surprising',
      body: 'Check the filtered tap again, and confirm you sampled after the RO system rather than untreated tap water.',
    },
    {
      title: 'Follow the meter manufacturer’s instructions',
      body: 'Rinse the probe or cup as directed and wait for the reading to settle before you record it.',
    },
    {
      title: 'Do not treat a low TDS number as a contaminant test',
      body: 'A lower reading does not prove the water is safer or that PFAS, lead, or arsenic are absent.',
    },
  ],
  escalate: 'Consider contacting Highlands Ranch Water.',
  evidenceIntro:
    'These are quarterly averages of finished-water samples reported by Highlands Ranch Water for 2025. A home meter reading is a different type of measurement.',
  epaContext:
    'EPA secondary standards are non-mandatory federal guidelines addressing aesthetic effects such as taste, odor, deposits, and staining. The TDS secondary guideline is not a health-based drinking-water MCL.',
  sourcesIntro:
    'Information on this page is from Highlands Ranch Water Water Quality Indicators and U.S. EPA Secondary Drinking Water Standards. Your home meter reading is supplied by you and is not an official laboratory result.',
  limitation:
    'WaterLens does not diagnose plumbing problems, estimate unmeasured contaminants, or treat a home TDS meter as equivalent to a certified laboratory method.',
  sourcesNote: 'Official TDS values are stored locally from the HRW Water Quality Indicators source. This page does not fetch the HRW website at runtime.',
} as const

export function parseTdsInput(
  raw: string,
): { ok: true; value: number; display: string } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Enter your TDS reading.' }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return { ok: false, error: 'Enter a non-negative number only. Do not include letters or symbols.' }
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return { ok: false, error: 'Enter a valid number.' }
  if (value < 0) return { ok: false, error: 'The reading cannot be negative.' }
  if (value > TDS_INPUT_MAX) {
    return {
      ok: false,
      error: `Enter a reading of ${TDS_INPUT_MAX} ppm or less. If your meter shows a higher value, repeat the test or contact Highlands Ranch Water.`,
    }
  }
  return { ok: true, value, display: trimmed }
}

function vsHrw(reading: number, min: number, max: number): TdsHrwRelation {
  if (reading < min) return 'below'
  if (reading > max) return 'above'
  return 'within'
}

function vsEpa(reading: number): TdsEpaRelation {
  if (reading < EPA_TDS_SMCL_MG_L) return 'below'
  if (reading === EPA_TDS_SMCL_MG_L) return 'at'
  return 'above'
}

function hrwNarrative(reading: number, relation: TdsHrwRelation, min: number, max: number): string {
  if (relation === 'within') {
    return `Your reading of ${reading} ppm falls within the range of Highlands Ranch Water’s published 2025 quarterly TDS averages (${min}–${max} mg/L).`
  }
  return `Your reading of ${reading} ppm is outside Highlands Ranch Water’s published 2025 quarterly average range (${min}–${max} mg/L). A home meter reading and a utility laboratory result are not the same type of measurement, so consider repeating the reading before drawing a conclusion.`
}

function epaNarrative(relation: TdsEpaRelation): string {
  if (relation === 'above') {
    return `This reading is above EPA’s ${EPA_TDS_SMCL_MG_L} mg/L secondary/aesthetic guideline for TDS. That guideline relates to aesthetic effects such as taste, deposits, and staining; it is not a health-based drinking-water limit.`
  }
  if (relation === 'at') {
    return `Your reading is at EPA’s ${EPA_TDS_SMCL_MG_L} mg/L Secondary Maximum Contaminant Level for TDS, which is an aesthetic guideline related to issues such as taste, deposits, and staining — not a federal health-based MCL. TDS is not a direct measure of drinking-water safety.`
  }
  return `TDS is not a direct measure of drinking-water safety. Your reading is below EPA’s ${EPA_TDS_SMCL_MG_L} mg/L Secondary Maximum Contaminant Level for TDS, which is an aesthetic guideline related to issues such as taste, deposits, and staining — not a federal health-based MCL.`
}

function roNarrative(reading: number): string {
  return `Reverse osmosis is designed to reduce dissolved ions, so an RO-filtered TDS reading can be much lower than the public-water-system value. A reading of ${reading} ppm after reverse osmosis can be expected and indicates that the system has reduced dissolved solids. It does NOT by itself prove that the filtered water is safer or that specific contaminants such as PFAS, lead, or arsenic are absent.`
}

export function interpretTdsReading(raw: string, waterType: TdsWaterType): TdsResult {
  const parsed = parseTdsInput(raw)
  if (!parsed.ok) return { valid: false, error: parsed.error }

  const reading = parsed.value
  const stats = hrwTdsStats()
  const hrw = vsHrw(reading, stats.min, stats.max)
  const epa = vsEpa(reading)

  const headline =
    waterType === 'ro'
      ? `Your RO-filtered reading is ${parsed.display} ppm.`
      : `Your tap-water reading is ${parsed.display} ppm.`

  return {
    valid: true,
    reading,
    displayReading: parsed.display,
    unit: 'ppm',
    waterType,
    hrwMin: stats.min,
    hrwMax: stats.max,
    hrwMean: stats.mean,
    hrwMedian: stats.median,
    hrwLatest: stats.latest.value,
    hrwLatestQuarter: stats.latest.quarter,
    epaSmcl: EPA_TDS_SMCL_MG_L,
    vsHrw: hrw,
    vsEpa: epa,
    headline,
    hrwNarrative: hrwNarrative(reading, hrw, stats.min, stats.max),
    epaNarrative: epaNarrative(epa),
    roNarrative: waterType === 'ro' ? roNarrative(reading) : null,
    escalate: waterType === 'tap' && hrw !== 'within',
    sourceYear: HRW_TDS_2025.year,
    sourceUnit: HRW_TDS_2025.unit,
  }
}

export function isTdsInterpretation(result: TdsResult): result is TdsInterpretation {
  return result.valid
}
