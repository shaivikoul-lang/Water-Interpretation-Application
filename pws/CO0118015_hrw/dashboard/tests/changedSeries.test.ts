import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  overlayOfficialChangedSeries,
  splitChangedAnalytes,
} from '../src/lib/changedSeries.ts'
import { heroSafetyStatus, latestRowForAnalyte } from '../src/lib/derive.ts'
import type { AnalytePack } from '../src/types/water.ts'

function pack(name: string, years: number[], extras: Partial<AnalytePack> = {}): AnalytePack {
  return {
    analyte_name: name,
    summary_latest_year: years[years.length - 1] ?? 0,
    by_year: years.map((year) => ({
      year,
      max_concentration: 0.01,
      sdwa_limit: 1,
      unit: 'mg/L',
      category: 'Well Below Limit',
      over_limit: false,
    })),
    ...extras,
  }
}

test('splits long Colorado series above newer or different tests', () => {
  const { comparable, newerProgram } = splitChangedAnalytes(
    overlayOfficialChangedSeries([
      pack('Arsenic', [1999, 2025]),
      pack('Copper', [2000, 2001, 2002]),
      pack('Lithium', [], { summary_latest_year: 0 }),
      pack('PFOA', [2025]),
      pack('Nitrate', [1999, 2025]),
      pack('Turbidity', [2015, 2016, 2017]),
    ]),
  )
  assert.deepEqual(
    comparable.map((a) => a.analyte_name),
    ['Arsenic', 'Nitrate'],
  )
  assert.deepEqual(
    newerProgram.map((a) => a.analyte_name),
    ['Copper', 'Lithium', 'PFOA', 'Turbidity'],
  )
})

test('replaces 2000–2002 copper and lead with official tap 90th years', () => {
  const [copper, lead] = overlayOfficialChangedSeries([
    pack('Copper', [2000, 2001, 2002]),
    pack('Lead', [2000, 2001, 2002]),
  ])
  assert.deepEqual(
    copper.by_year.map((r) => [r.year, r.max_concentration]),
    [
      [2024, 0.06],
      [2025, 0.33],
    ],
  )
  assert.equal(copper.summary_latest_year, 2025)
  assert.equal(copper.by_year[1]?.sdwa_limit, 1.3)
  assert.equal(copper.by_year[1]?.category, 'Below action level')
  assert.equal(copper.by_year[1]?.over_limit, false)

  assert.deepEqual(
    lead.by_year.map((r) => [r.year, r.max_concentration]),
    [[2024, 4]],
  )
  assert.equal(lead.by_year[0]?.sdwa_limit, 15)
  assert.equal(lead.by_year[0]?.unit, 'ug/L')
})

test('fills lithium from official 2024 screening without treating HRL as an MCL', () => {
  const [lithium] = overlayOfficialChangedSeries([
    pack('Lithium', [], { summary_latest_year: 0 }),
  ])
  const latest = latestRowForAnalyte(lithium)
  assert.equal(latest?.year, 2024)
  assert.equal(latest?.max_concentration, 21.7)
  assert.equal(latest?.sdwa_limit, null)
  assert.equal(latest?.category, 'No federal limit')
  assert.equal(latest?.over_limit, false)
})

test('uses official 2024–2025 PFAS averages, not the extract yearly max', () => {
  const [pfoa, pfos] = overlayOfficialChangedSeries([
    pack('PFOA', [2025]),
    pack('PFOS', [2025]),
  ])
  assert.deepEqual(
    pfoa.by_year.map((r) => [r.year, r.max_concentration, r.sdwa_limit]),
    [
      [2024, 0.48, 4],
      [2025, 0.61, 4],
    ],
  )
  assert.equal(pfoa.by_year[1]?.category, 'Below Limit')
  assert.equal(pfos.by_year[0]?.max_concentration, null)
  assert.equal(pfos.by_year[0]?.category, 'Below reporting level')
})

test('overlay does not turn the hero red for lithium or LCR action-level context', () => {
  const analytes = overlayOfficialChangedSeries([
    pack('Arsenic', [2025]),
    pack('Copper', [2002]),
    pack('Lead', [2002]),
    pack('Lithium', []),
    pack('PFOA', [2025]),
  ])
  assert.equal(heroSafetyStatus(analytes), 'calm')
})
