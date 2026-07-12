import type { ConcernDef, ConcernId } from './concerns'
import { TASTE_SECONDARY_ANALYTE } from './concerns'
import {
  latestRowForAnalyte,
  measureSummaryCounts,
  overallStatus,
  ratioPercent,
  snapshotSummaryLine,
  trendDirection,
  type OverallTone,
} from './derive'
import type { AnalytePack, EducationPayload, PwsPayload, YearRow } from '../types/water'

export type InsightContent = {
  title: string
  headline: string
  verdict: string
  nextStep: string
  disclaimer: string
  tone: OverallTone
}

export type EvidenceMode = 'chart' | 'measurement' | 'education-only' | 'system-summary'

export type SourceLink = { label: string; url: string }

const DISCLAIMER =
  'Published monitoring for the whole water system — your home tap may differ. This is an independent community tool, not HR Water or CDPHE.'

/** HRW taste branch revisions (Q2–Q7) — implement after stakeholder response. */
export const TASTE_CONTENT_PENDING_HRW = true

export function resolveAnalyte(
  concern: ConcernDef,
  clarifyId: string,
  water: PwsPayload,
): AnalytePack | null {
  const find = (name: string) =>
    water.analytes.find((a) => a.analyte_name === name) ?? null

  if (concern.id === 'changes' && clarifyId === 'specific') {
    return find('PFOA') ?? find('PFAS') ?? find(concern.primaryAnalyteName)
  }
  if (concern.id === 'report' || (concern.id === 'changes' && clarifyId === 'worse')) {
    return null
  }
  if (concern.id === 'changes' && clarifyId === 'overview') {
    return null
  }
  if (!concern.primaryAnalyteName) return null
  return find(concern.primaryAnalyteName)
}

export function evidenceMode(concernId: ConcernId, clarifyId: string): EvidenceMode {
  if (concernId === 'taste') return clarifyId === 'chlorine' ? 'chart' : 'education-only'
  if (concernId === 'pfas') return clarifyId === 'levels' ? 'chart' : 'education-only'
  if (concernId === 'lead') return 'education-only'
  if (concernId === 'report') return 'system-summary'
  if (concernId === 'changes') {
    if (clarifyId === 'taste-changes' || clarifyId === 'specific') return 'chart'
    return 'system-summary'
  }
  return 'education-only'
}

export function sourceLinks(concernId: ConcernId): SourceLink[] {
  const cdphe = { label: 'CDPHE', url: 'https://cdphe.colorado.gov/dwinfo' }
  const epa = { label: 'EPA drinking water', url: 'https://www.epa.gov/ground-water-and-drinking-water' }
  const hrw = { label: 'HR Water', url: 'https://www.hrwatershed.org/' }

  switch (concernId) {
    case 'taste':
      return [
        cdphe,
        { label: 'EPA — DBP rules', url: 'https://www.epa.gov/dwreginfo/stage-1-and-stage-2-disinfectants-and-disinfection-byproducts-rules' },
        { label: 'EPA — secondary standards', url: 'https://www.epa.gov/sdwa/secondary-drinking-water-standards-guidance-nuisance-chemicals' },
        { label: 'EPA — Consumer Confidence Reports', url: 'https://www.epa.gov/ccr' },
        hrw,
      ]
    case 'pfas':
      return [
        { label: 'EPA — PFAS', url: 'https://www.epa.gov/pfas' },
        { label: 'EPA — PFAS drinking water rule', url: 'https://www.epa.gov/sdwa/and-polyfluoroalkyl-substances-pfas' },
        cdphe,
        hrw,
      ]
    case 'lead':
      return [
        { label: 'EPA — Lead and Copper Rule', url: 'https://www.epa.gov/dwreginfo/lead-and-copper-rule' },
        { label: 'EPA — basic information on lead', url: 'https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-lead-drinking-water' },
        cdphe,
        hrw,
      ]
    case 'report':
      return [
        { label: 'EPA — CCR rule', url: 'https://www.epa.gov/ccr' },
        { label: 'EPA — how EPA regulates drinking water', url: 'https://www.epa.gov/dwreginfo/how-epa-regulates-drinking-water' },
        cdphe,
        hrw,
      ]
    case 'changes':
      return [cdphe, epa, hrw]
    default:
      return [cdphe, epa]
  }
}

function analyteTone(row: YearRow | undefined): OverallTone {
  if (!row) return 'calm'
  if (row.over_limit || row.category === 'Above Limit') return 'act'
  if (row.category === 'Approaching Limit' || row.category === 'Moderate') return 'watch'
  return 'calm'
}

function formatValue(row: YearRow): string {
  if (row.max_concentration == null) return '—'
  const n = row.max_concentration
  const formatted = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
  return `${formatted} ${row.unit ?? ''}`.trim()
}

function formatLimit(row: YearRow): string | null {
  if (row.sdwa_limit == null) return null
  const n = row.sdwa_limit
  const formatted = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
  return `${formatted} ${row.unit ?? ''}`.trim()
}

function hadHistoricalExceedances(analyte: AnalytePack): boolean {
  const latest = latestRowForAnalyte(analyte)
  if (!latest) return false
  return analyte.by_year.some(
    (r) => r.year < latest.year && (r.over_limit || r.category === 'Above Limit'),
  )
}

function shortAnalyteName(name: string): string {
  if (name.startsWith('TTHM')) return 'TTHMs (disinfection byproducts)'
  if (name === 'PFOA') return 'PFOA (a PFAS compound)'
  return name
}

function analyteVerdict(analyte: AnalytePack, row: YearRow): string {
  const tone = analyteTone(row)
  const year = row.year
  const label = shortAnalyteName(analyte.analyte_name)
  if (tone === 'calm') {
    return `For ${label}, recent public monitoring (${year}) shows levels well below federal limits in data Highlands Ranch Water reports to the state.`
  }
  if (tone === 'watch') {
    return `For ${label}, recent public monitoring (${year}) is closer to federal limits but not above them in the latest reporting year.`
  }
  return `For ${label}, the latest reporting year (${year}) shows a level above the federal limit used in this dataset.`
}

export function buildInsight(
  concern: ConcernDef,
  clarifyId: string,
  water: PwsPayload,
  analyte: AnalytePack | null,
): InsightContent {
  switch (concern.id) {
    case 'taste':
      return buildTasteInsight(concern, clarifyId, analyte)
    case 'pfas':
      return buildPfasInsight(concern, clarifyId, analyte)
    case 'lead':
      return buildLeadInsight(concern, clarifyId)
    case 'report':
      return buildReportInsight(concern, clarifyId, water)
    case 'changes':
      return buildChangesInsight(concern, clarifyId, water, analyte)
    default:
      return fallbackInsight(concern)
  }
}

function fallbackInsight(concern: ConcernDef): InsightContent {
  return {
    title: concern.insightTitle,
    headline: 'We can help orient you with public data and official sources.',
    verdict: 'Explore full water data for the complete monitoring picture.',
    nextStep: 'Use official HR Water and regulator pages for decisions about your home.',
    disclaimer: DISCLAIMER,
    tone: 'calm',
  }
}

function buildTasteInsight(
  concern: ConcernDef,
  clarifyId: string,
  analyte: AnalytePack | null,
): InsightContent {
  const row = analyte ? latestRowForAnalyte(analyte) : undefined
  const tone = clarifyId === 'chlorine' ? analyteTone(row) : 'calm'

  const headlines: Record<string, string> = {
    chlorine: 'A chlorine smell is common — and usually not a sign of trouble.',
    metallic: 'A metallic taste often comes from home plumbing, not the water supply.',
    musty: 'Earthy or musty odors can happen when water sources change seasonally.',
    unsure: 'Noticing something different is common — most changes are not emergencies.',
  }

  const educationVerdicts: Record<string, string> = {
    metallic:
      'Metallic taste is often caused by household plumbing or fixtures. This public dataset does not measure metallic taste at your tap.',
    musty:
      'Musty or earthy odors can follow seasonal source changes. Odor is not measured as a single number in this public dataset.',
    unsure:
      'Taste and odor are not measured as a single number in Colorado’s public monitoring export for this system.',
  }

  let verdict: string
  if (clarifyId === 'chlorine') {
    if (!analyte || !row) {
      verdict =
        'We could not load disinfection byproduct data. Explore full water data for the complete picture.'
    } else {
      verdict = analyteVerdict(analyte, row)
    }
  } else {
    verdict = educationVerdicts[clarifyId] ?? educationVerdicts.unsure
  }

  const nextSteps: Record<string, string> = {
    chlorine:
      "If taste is your only concern, you likely don't need to call anyone. Contact HR Water if it's sudden, strong, or paired with color or pressure changes.",
    metallic:
      "Try running the tap for a minute or using a different faucet. Contact HR Water if the taste is new, strong, or affects every tap.",
    musty:
      'Seasonal source changes are common. Contact HR Water if odor persists, or you see color, sediment, or pressure problems.',
    unsure:
      "Note when you noticed the change. Contact HR Water if it's sudden, widespread, or paired with color or pressure issues.",
  }

  return {
    title: concern.insightTitle,
    headline: headlines[clarifyId] ?? headlines.unsure,
    verdict,
    nextStep: nextSteps[clarifyId] ?? nextSteps.unsure,
    disclaimer: DISCLAIMER,
    tone,
  }
}

function buildPfasInsight(
  concern: ConcernDef,
  clarifyId: string,
  analyte: AnalytePack | null,
): InsightContent {
  const row = analyte ? latestRowForAnalyte(analyte) : undefined
  const tone = analyteTone(row)

  const headlines: Record<string, string> = {
    filter: 'Filters can reduce some PFAS at the tap — but the right type matters.',
    health: 'PFAS health guidance comes from EPA and public health agencies — not this tool.',
    news: 'News about PFAS often refers to new rules or national studies — your utility reports local monitoring.',
    levels: 'Public data shows PFAS compounds Highlands Ranch Water has reported to the state.',
  }

  const verdicts: Record<string, string> = {
    filter:
      'Point-of-use filters certified for PFAS may help at one tap; whole-house systems vary. Public monitoring here reflects treated water leaving the plant — not your kitchen tap after plumbing.',
    health:
      row
        ? `EPA and CDPHE publish health reference material for PFAS. In recent public data, PFOA is reported at ${formatValue(row)} (limit in file: ${formatLimit(row) ?? 'see official sources'}).`
        : 'See EPA and CDPHE for current health guidance on PFAS in drinking water.',
    news:
      'Federal PFAS rules and health studies evolve. Local relevance depends on what HR Water reports in public monitoring and consumer notices — not headlines alone.',
    levels: row
      ? analyteVerdict(analyte!, row)
      : 'PFAS monitoring for this system appears in public data — open Show me why or Explore for detail.',
  }

  const nextSteps: Record<string, string> = {
    filter:
      'Look for NSF-certified PFAS filters if you want treatment at home. Contact HR Water or CDPHE with product questions.',
    health:
      'For personal health questions, talk to a clinician and read EPA/CDPHE materials — not this student-built viewer.',
    news:
      'Check HR Water consumer information and CDPHE updates alongside national news.',
    levels:
      'If you want every PFAS measure and year, use Explore full water data. Contact HR Water with specific worries.',
  }

  return {
    title: concern.insightTitle,
    headline: headlines[clarifyId] ?? headlines.levels,
    verdict: verdicts[clarifyId] ?? verdicts.levels,
    nextStep: nextSteps[clarifyId] ?? nextSteps.levels,
    disclaimer: DISCLAIMER,
    tone,
  }
}

function buildLeadInsight(concern: ConcernDef, clarifyId: string): InsightContent {
  const headlines: Record<string, string> = {
    children: 'Young children are the main focus of lead-in-water public health guidance.',
    plumbing: 'Lead at the tap usually comes from plumbing — especially in older homes.',
    'read-report': 'Lead results in reports follow special rules — not the same as every other contaminant.',
    overview: 'Lead in drinking water is managed under the Lead and Copper Rule — built around tap sampling.',
  }

  const verdicts: Record<string, string> = {
    children:
      'EPA guidance emphasizes protecting infants and young children from lead in drinking water. System-wide monitoring here does not test your tap — home plumbing matters.',
    plumbing:
      'Corrosion control and household plumbing (pipes, fixtures, solder) strongly affect lead at the kitchen sink. Plant monitoring alone cannot prove your tap is lead-free.',
    'read-report':
      'Lead uses action levels and tap sampling programs under the Lead and Copper Rule — not a simple yearly maximum compared to one number in every row.',
    overview:
      'Highlands Ranch Water reports lead-related data to the state, but interpreting risk requires EPA/CDPHE consumer materials and often tap-specific context.',
  }

  const nextSteps: Record<string, string> = {
    children:
      'If you have infants using formula mixed with tap water, read EPA basic lead information and consider HR Water guidance.',
    plumbing:
      'If you live in an older home, learn about flushing taps and certified filters. Contact HR Water with service questions.',
    'read-report':
      'Use Explore full water data for reported values, but pair with EPA LCRI explainers for what action levels mean.',
    overview:
      'Start with EPA Lead and Copper Rule materials and CDPHE dwinfo — then Explore for local reported data.',
  }

  return {
    title: concern.insightTitle,
    headline: headlines[clarifyId] ?? headlines.overview,
    verdict: verdicts[clarifyId] ?? verdicts.overview,
    nextStep: nextSteps[clarifyId] ?? nextSteps.overview,
    disclaimer: DISCLAIMER,
    tone: 'calm',
  }
}

function buildReportInsight(
  concern: ConcernDef,
  clarifyId: string,
  water: PwsPayload,
): InsightContent {
  const summary = measureSummaryCounts(water.analytes)
  const tone = overallStatus(water.analytes)
  const summaryLine = snapshotSummaryLine(summary)

  const headlines: Record<string, string> = {
    units: 'Water reports use technical units — but the ideas are learnable.',
    limits: 'Limits in reports compare monitoring results to federal or state standards.',
    monitoring: 'Utilities monitor many contaminants on a schedule set by regulators.',
    overview: 'A water quality report summarizes what was tested and what was found.',
  }

  const verdicts: Record<string, string> = {
    units:
      'Concentrations may appear as µg/L (ppb), mg/L (ppm), or ng/L for trace compounds like PFAS. The unit should always appear next to the number.',
    limits:
      'A result below the limit in the file means the system met that standard in the reporting period shown — not necessarily that your tap matches that number.',
    monitoring:
      `Highlands Ranch Water reports many regulated contaminants over time. Latest snapshot in this tool: ${summaryLine}`,
    overview:
      `This dashboard turns public monitoring for PWS CO0118015 into plain language. Latest snapshot: ${summaryLine}`,
  }

  const nextSteps: Record<string, string> = {
    units: 'Open Explore full water data — each measure shows its unit and latest value.',
    limits: 'Tap any measure in Explore to see how it compares to the limit used in this dataset.',
    monitoring: 'Use Topics in Explore for PFAS, lead, hardness, and taste context.',
    overview: 'Explore full water data for charts, or Year-by-year tables for raw history.',
  }

  return {
    title: concern.insightTitle,
    headline: headlines[clarifyId] ?? headlines.overview,
    verdict: verdicts[clarifyId] ?? verdicts.overview,
    nextStep: nextSteps[clarifyId] ?? nextSteps.overview,
    disclaimer: DISCLAIMER,
    tone,
  }
}

function buildChangesInsight(
  concern: ConcernDef,
  clarifyId: string,
  water: PwsPayload,
  analyte: AnalytePack | null,
): InsightContent {
  const tone = overallStatus(water.analytes)

  const headlines: Record<string, string> = {
    'taste-changes': 'Taste and smell can shift when sources or treatment change — even when monitoring looks steady.',
    specific: 'Individual contaminants can trend up or down over the years in public data.',
    worse: 'A system-wide view helps show whether recent years look steadier or more flagged.',
    overview: 'Long-term charts can put a single worrying headline in context.',
  }

  let verdict: string
  if (clarifyId === 'taste-changes' && analyte) {
    const row = latestRowForAnalyte(analyte)
    verdict = row
      ? `TTHMs are a regulated proxy related to treatment — not a direct taste score. Latest year (${row.year}): ${row.category ?? 'see data'}.`
      : 'Taste is not measured directly; disinfection byproducts are one related measure in public data.'
  } else if (clarifyId === 'specific' && analyte) {
    const row = latestRowForAnalyte(analyte)
    verdict = row
      ? `For ${shortAnalyteName(analyte.analyte_name)}, the latest reporting year is ${row.year}. Open the trend chart below for year-by-year context.`
      : 'Pick Explore full water data to compare measures over time.'
  } else {
    const summary = measureSummaryCounts(water.analytes)
    verdict = `Across regulated measures in this dataset, the latest-year snapshot: ${snapshotSummaryLine(summary)}`
  }

  const nextSteps: Record<string, string> = {
    'taste-changes':
      'Contact HR Water if a taste change is sudden or paired with color or pressure problems.',
    specific: 'Use Explore to switch between contaminants and compare trends.',
    worse: 'Explore shows Safe / Moderate / Above counts for the latest reporting year.',
    overview: 'Explore full water data for every trend, or Classic tables for year-by-year numbers.',
  }

  return {
    title: concern.insightTitle,
    headline: headlines[clarifyId] ?? headlines.overview,
    verdict,
    nextStep: nextSteps[clarifyId] ?? nextSteps.overview,
    disclaimer: DISCLAIMER,
    tone,
  }
}

export function whyBullets(concernId: ConcernId, clarifyId: string): string[] {
  if (concernId === 'taste') return tasteWhyBullets(clarifyId)
  if (concernId === 'pfas') return pfasWhyBullets(clarifyId)
  if (concernId === 'lead') return leadWhyBullets(clarifyId)
  if (concernId === 'report') return reportWhyBullets(clarifyId)
  if (concernId === 'changes') return changesWhyBullets(clarifyId)
  return []
}

function tasteWhyBullets(clarifyId: string): string[] {
  const shared = [
    'Chlorine disinfects water to protect against germs — a faint smell can be normal, especially after line work or outages.',
    'TTHMs are disinfection byproducts tracked to make sure treatment stays within federal limits.',
    'What you notice at one faucet can differ from system-wide monitoring — plumbing and how long water sits in pipes matter.',
  ]
  const variants: Record<string, string[]> = {
    chlorine: [
      'A chlorine or chemical smell often comes from normal disinfection, not contamination.',
      ...shared.slice(1),
      'Letting water sit in a pitcher (uncovered) can help chlorine smell fade at the tap.',
    ],
    metallic: [
      'Metallic taste is often from pipes, fixtures, or water sitting in household plumbing.',
      'Regulated measures like TTHMs reflect treatment at the plant — not metallic taste at your sink.',
      'If only one faucet is affected, the cause is more likely inside your home than the public supply.',
      'HR Water can help if the taste is new, strong, or appears at every tap.',
    ],
    musty: [
      'Musty or earthy odors can follow seasonal changes in source water or algae in reservoirs.',
      'Utilities adjust treatment when sources change — odor does not always mean a safety problem.',
      'Odor is not measured as a single number in this public dataset.',
      'Report persistent odor, color, or pressure changes to HR Water.',
    ],
    unsure: shared,
  }
  return variants[clarifyId] ?? variants.unsure
}

function pfasWhyBullets(clarifyId: string): string[] {
  const variants: Record<string, string[]> = {
    filter: [
      'Not all pitchers or fridge filters remove PFAS — look for certification against PFAS reduction.',
      'Filters treat water at one tap; they do not change public system monitoring results.',
      'Boiling water does not remove PFAS and can concentrate some contaminants.',
    ],
    health: [
      'PFAS are a large family of chemicals; EPA has been updating drinking water standards and health references.',
      'Population studies inform regulators; they do not predict any one person’s outcome.',
      'Medical questions belong with clinicians and official EPA/CDPHE pages.',
    ],
    news: [
      'National news often covers new EPA rules or detections elsewhere — always check local utility reporting.',
      'Colorado and HR Water may publish updates on a different timeline than federal headlines.',
      'This tool only shows what appears in Colorado’s public EPHT export.',
    ],
    levels: [
      'PFOA is one of several PFAS compounds that may appear in monitoring.',
      'Limits and health references for PFAS have evolved — use EPA’s current materials for context.',
      'A single year in public data does not replace HR Water’s full consumer information.',
    ],
  }
  return variants[clarifyId] ?? variants.levels
}

function leadWhyBullets(clarifyId: string): string[] {
  const variants: Record<string, string[]> = {
    children: [
      'Infants who drink formula mixed with tap water can be more vulnerable to lead exposure.',
      'Lead in water is usually from plumbing and fixtures — not only from the treatment plant.',
      'Flushing taps and using cold water for drinking and cooking are common EPA suggestions.',
    ],
    plumbing: [
      'Homes built before 1986 are more likely to have lead-soldered plumbing or brass fixtures.',
      'Lead service lines are rare in some areas but remain a national focus of the LCRI.',
      'Corrosion control treatment at the plant helps, but cannot guarantee every tap.',
    ],
    'read-report': [
      'The Lead and Copper Rule focuses on tap sampling — especially at high-risk homes.',
      'Action levels trigger follow-up steps; they are not identical to maximum contaminant levels for other chemicals.',
      'A zero or low value in a compliance file still does not replace testing your own tap if you are worried.',
    ],
    overview: [
      'EPA’s basic lead page is a good starting point for households.',
      'CDPHE publishes Colorado consumer drinking water information.',
      'This viewer shows reported data — not a home lead test.',
    ],
  }
  return variants[clarifyId] ?? variants.overview
}

function reportWhyBullets(clarifyId: string): string[] {
  const variants: Record<string, string[]> = {
    units: [
      'µg/L and ng/L are tiny amounts — regulators use them for trace contaminants.',
      'mg/L is often used for minerals and other higher-concentration measures.',
      'Always read the unit beside the number before comparing two results.',
    ],
    limits: [
      'Primary standards are enforceable health-based limits for public water systems.',
      'Some aesthetic factors (taste, odor, color) fall under secondary guidelines — not the same as primary limits.',
      '“Below limit” in a table refers to the standard named in that row — not a guarantee about your tap.',
    ],
    monitoring: [
      'Utilities test on schedules set by EPA and the state — not every contaminant every day.',
      'Some contaminants are monitored continuously (like disinfectant residuals); others annually or less often.',
      'Explore mode groups measures by topic to make scanning easier.',
    ],
    overview: [
      'Consumer Confidence Reports summarize a year of compliance monitoring for your utility.',
      'This WaterLens view uses the same underlying public data in a more visual format.',
      'Year-by-year tables are best when you need exact historical numbers.',
    ],
  }
  return variants[clarifyId] ?? variants.overview
}

function changesWhyBullets(clarifyId: string): string[] {
  const variants: Record<string, string[]> = {
    'taste-changes': [
      'Source blending (surface vs. groundwater) can change taste without changing every regulated number.',
      'TTHMs reflect disinfection chemistry — one related measure, not a taste score.',
      'Ask HR Water if utility work or seasonal changes might explain what you notice.',
    ],
    specific: [
      'Trend charts show highest reported levels per year — useful for spotting direction, not daily tap quality.',
      'One bad year in the past does not always mean today’s water is the same.',
      'Compare several years before drawing conclusions from a single headline.',
    ],
    worse: [
      '“Above limit” in this dataset means above the EPA-style limit used in the file for that year.',
      'Recent years may look calmer even if older years had exceedances.',
      'Explore shows how many measures fall in Safe, Moderate, or Above buckets for the latest year.',
    ],
    overview: [
      'Long timelines help separate old problems from current conditions.',
      'Classic tables list every year if you need to verify a specific value.',
      'Official utility notices still matter for treatment changes not obvious in charts.',
    ],
  }
  return variants[clarifyId] ?? variants.overview
}

export function evidenceNarrative(
  concern: ConcernDef,
  clarifyId: string,
  water: PwsPayload,
  analyte: AnalytePack | null,
): string {
  const mode = evidenceMode(concern.id, clarifyId)

  if (mode === 'education-only') {
    if (concern.id === 'lead') {
      return 'Lead in public files is interpreted under the Lead and Copper Rule — tap sampling and action levels — not as a simple pass/fail on one yearly maximum. See official EPA and CDPHE materials below.'
    }
    if (concern.id === 'pfas') {
      return 'PFAS guidance and limits continue to evolve at EPA. The bullets above summarize context; local monitoring appears in Explore full water data.'
    }
    if (concern.id === 'taste') {
      return 'This public dataset does not measure taste or odor directly. The bullets above explain common causes; explore full water data for regulated measures and trends.'
    }
    return 'The explanation above is based on official guidance. Open Explore full water data for all reported measures and trends.'
  }

  if (mode === 'system-summary') {
    const summary = measureSummaryCounts(water.analytes)
    const tone = overallStatus(water.analytes)
    const years = water.years_present
    const span =
      years.length >= 2 ? `${years[0]}–${years[years.length - 1]}` : `${years[0] ?? '—'}`
    return `System-wide snapshot across ${water.analytes.length} regulated measures (${span}): ${snapshotSummaryLine(summary)} Overall signal in latest reporting years: ${tone === 'calm' ? 'steady relative to limits in file' : tone === 'watch' ? 'some measures worth a closer look' : 'some measures above limits in latest year'}.`
  }

  if (!analyte) {
    return 'Supporting measurement data is unavailable for this concern right now.'
  }

  const row = latestRowForAnalyte(analyte)
  if (!row) return 'No recent measurement is available for this analyte in public data.'

  const trend = trendDirection(analyte)
  const ratio = ratioPercent(row)
  const hadPast = hadHistoricalExceedances(analyte)

  let trendPhrase: string
  if (trend === 'up') {
    trendPhrase = 'Recent years show levels edging higher, though still within context of the federal limit.'
  } else if (trend === 'down') {
    trendPhrase = 'Recent years show levels trending down compared with earlier reporting.'
  } else {
    trendPhrase = 'Levels have stayed relatively steady across the years with data.'
  }

  if (hadPast && analyteTone(row) === 'calm') {
    trendPhrase += ' Older public records included years above the limit; recent reporting years are well below it.'
  }

  const pct =
    ratio != null ? `about ${Math.round(ratio)}% of the federal limit` : 'within the limit range in this dataset'

  return `This supports the insight above: the latest reported level (${row.year}) is ${pct}. ${trendPhrase}`
}

export type MeasurementDisplay = {
  analyteName: string
  value: string
  limit: string | null
  ratioLabel: string | null
  category: string | null
  year: number | null
}

export function measurementDisplay(analyte: AnalytePack | null): MeasurementDisplay | null {
  if (!analyte) return null
  const row = latestRowForAnalyte(analyte)
  if (!row) return null
  if (analyte.analyte_name === 'Lead' || analyte.analyte_name === 'Copper') return null

  const ratio = ratioPercent(row)
  return {
    analyteName: analyte.analyte_name,
    value: formatValue(row),
    limit: formatLimit(row),
    ratioLabel:
      ratio != null && row.sdwa_limit != null ? `${Math.round(ratio)}% of limit` : null,
    category: row.category ?? null,
    year: row.year,
  }
}

export function supplementaryMeasurements(
  concern: ConcernDef,
  clarifyId: string,
  water: PwsPayload,
): MeasurementDisplay[] {
  if (concern.id === 'taste' && clarifyId === 'chlorine') {
    const haa5 = water.analytes.find((a) => a.analyte_name === TASTE_SECONDARY_ANALYTE)
    const display = measurementDisplay(haa5 ?? null)
    return display ? [display] : []
  }
  return []
}

export function educationHook(
  analyte: AnalytePack | null,
  education: EducationPayload | null,
): string | null {
  if (!analyte || !education) return null
  return education.by_analyte_name[analyte.analyte_name]?.hook ?? null
}

export function educationOnlyBody(concernId: ConcernId, clarifyId: string): string | null {
  if (concernId === 'lead') {
    return 'Lead and copper are tracked under tap sampling programs and action levels. Values in Colorado’s public files are context only — see EPA Lead and Copper Rule materials for how to interpret them.'
  }
  if (concernId === 'pfas' && clarifyId !== 'levels') {
    return 'PFAS levels for this system are available in Explore full water data. EPA’s PFAS drinking water rule and CDPHE pages explain limits and health references.'
  }
  return null
}
