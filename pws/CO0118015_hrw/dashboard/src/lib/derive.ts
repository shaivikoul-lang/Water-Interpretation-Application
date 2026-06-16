import type { AnalytePack, YearRow } from '../types/water'

export function latestRowForAnalyte(a: AnalytePack): YearRow | undefined {
  const y = a.summary_latest_year
  return a.by_year.find((r) => r.year === y) ?? a.by_year[a.by_year.length - 1]
}

export function trendDirection(a: AnalytePack): 'up' | 'down' | 'flat' {
  const scored = [...a.by_year]
    .filter((r) => r.risk_score != null && r.risk_score === r.risk_score)
    .sort((x, y) => x.year - y.year)
  if (scored.length < 2) return 'flat'
  const last = scored[scored.length - 1].risk_score!
  const prev = scored[scored.length - 2].risk_score!
  if (last > prev + 3) return 'up'
  if (last < prev - 3) return 'down'
  return 'flat'
}

export type OverallTone = 'calm' | 'watch' | 'act'

export function overallStatus(analytes: AnalytePack[]): OverallTone {
  for (const a of analytes) {
    const row = latestRowForAnalyte(a)
    if (!row) continue
    if (row.over_limit || row.category === 'Above Limit') return 'act'
  }
  for (const a of analytes) {
    const row = latestRowForAnalyte(a)
    if (!row) continue
    if (row.category === 'Approaching Limit') return 'watch'
  }
  for (const a of analytes) {
    const row = latestRowForAnalyte(a)
    if (row?.category === 'Moderate') return 'watch'
  }
  return 'calm'
}

export type MeasureSummary = { safe: number; moderate: number; above: number }

export function measureSummaryCounts(analytes: AnalytePack[]): MeasureSummary {
  const counts = { safe: 0, moderate: 0, above: 0 }
  for (const a of analytes) {
    const row = latestRowForAnalyte(a)
    if (!row) {
      counts.safe++
      continue
    }
    if (row.over_limit || row.category === 'Above Limit') counts.above++
    else if (
      row.category === 'Approaching Limit' ||
      row.category === 'Moderate'
    )
      counts.moderate++
    else counts.safe++
  }
  return counts
}

/** Names of measures flagged in the latest reporting year. */
export function flaggedMeasureNames(analytes: AnalytePack[]): {
  moderate: string[]
  approaching: string[]
} {
  const moderate: string[] = []
  const approaching: string[] = []
  for (const a of analytes) {
    const row = latestRowForAnalyte(a)
    if (!row) continue
    if (row.category === 'Approaching Limit') approaching.push(a.analyte_name)
    else if (row.category === 'Moderate') moderate.push(a.analyte_name)
  }
  return { moderate, approaching }
}

function joinNames(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

export function watchAlertCopy(analytes: AnalytePack[]): {
  title: string
  desc: string
  action: string
  targetName: string | null
} {
  const { moderate, approaching } = flaggedMeasureNames(analytes)
  const allFlagged = [...approaching, ...moderate]

  if (allFlagged.length === 0) {
    return {
      title: 'Worth a closer look',
      desc: 'Review the measures below for context.',
      action: '👉 View measures',
      targetName: null,
    }
  }

  let desc: string
  if (allFlagged.length === 1) {
    const name = allFlagged[0]
    if (approaching.includes(name)) {
      desc = `${name} is approaching its limit in recent data—not above the limit yet.`
    } else {
      desc = `${name} is in a moderate range in recent data—not above the limit.`
    }
  } else {
    desc = `${joinNames(allFlagged)} are worth a closer look in recent data.`
  }

  return {
    title: 'Worth a closer look',
    desc,
    action: `👉 View ${allFlagged.length === 1 ? allFlagged[0] : 'affected measures'}`,
    targetName: allFlagged[0],
  }
}

export function snapshotSummaryLine(summary: MeasureSummary): string {
  if (summary.above > 0) {
    return `${summary.above} measure${summary.above === 1 ? '' : 's'} exceed${summary.above === 1 ? 's' : ''} the limit in recent data.`
  }
  if (summary.moderate > 0) {
    return 'No current exceedances. Some values are worth a closer look in recent data.'
  }
  return 'No current exceedances in recent data.'
}

/** Hero status line: green unless something is above limit or approaching limit. */
export function heroSafetyStatus(analytes: AnalytePack[]): OverallTone {
  const summary = measureSummaryCounts(analytes)
  if (summary.above > 0) return 'act'
  for (const a of analytes) {
    const row = latestRowForAnalyte(a)
    if (row?.category === 'Approaching Limit') return 'watch'
  }
  return 'calm'
}

export function categoryTone(
  cat?: string,
): 'good' | 'caution' | 'warning' | 'critical' {
  if (!cat) return 'good'
  if (cat === 'Above Limit') return 'critical'
  if (cat === 'Approaching Limit') return 'warning'
  if (cat === 'Moderate') return 'caution'
  return 'good'
}

export function ratioPercent(row: YearRow): number | null {
  if (
    row.max_concentration == null ||
    row.sdwa_limit == null ||
    row.sdwa_limit <= 0
  )
    return null
  return Math.min(150, (row.max_concentration / row.sdwa_limit) * 100)
}
