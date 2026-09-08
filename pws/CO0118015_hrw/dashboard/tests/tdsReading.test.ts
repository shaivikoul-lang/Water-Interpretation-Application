import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EPA_TDS_SMCL_MG_L, HRW_TDS_2025, hrwTdsStats } from '../src/lib/hrwTds2025.ts'
import { interpretTdsReading, TDS_INPUT_MAX } from '../src/lib/tdsReading.ts'

const stats = hrwTdsStats()

test('official 2025 HRW TDS quarters are stored, not derived', () => {
  assert.deepEqual(
    HRW_TDS_2025.samples.map((s) => [s.quarter, s.value]),
    [
      [1, 234],
      [2, 580],
      [3, 397],
      [4, 425],
    ],
  )
  assert.equal(HRW_TDS_2025.parameter, 'TDS')
  assert.equal(HRW_TDS_2025.unit, 'mg/L')
  assert.equal(HRW_TDS_2025.year, 2025)
  assert.equal(HRW_TDS_2025.sourceId, 'hrw_water_quality_indicators')
  assert.equal(stats.min, 234)
  assert.equal(stats.max, 580)
  assert.equal(stats.latest.value, 425)
  assert.equal(stats.latest.quarter, 4)
  assert.equal(stats.median, 411)
  assert.equal(stats.mean, 409)
})

test('tap reading below the HRW quarterly range', () => {
  const result = interpretTdsReading('100', 'tap')
  assert.equal(result.valid, true)
  if (!result.valid) return
  assert.equal(result.vsHrw, 'below')
  assert.equal(result.vsEpa, 'below')
  assert.equal(result.escalate, true)
  assert.match(result.hrwNarrative, /outside Highlands Ranch Water’s published 2025 quarterly average range/)
  assert.match(result.hrwNarrative, /not the same type of measurement/)
  assert.doesNotMatch(result.epaNarrative, /\bsafe\b/i)
  assert.doesNotMatch(result.epaNarrative, /\bunsafe\b/i)
})

test('tap reading within the HRW quarterly range', () => {
  const result = interpretTdsReading('340', 'tap')
  assert.equal(result.valid, true)
  if (!result.valid) return
  assert.equal(result.displayReading, '340')
  assert.equal(result.vsHrw, 'within')
  assert.equal(result.vsEpa, 'below')
  assert.equal(result.escalate, false)
  assert.match(result.hrwNarrative, /falls within the range of Highlands Ranch Water’s published 2025 quarterly TDS averages/)
  assert.match(result.epaNarrative, /not a direct measure of drinking-water safety/)
  assert.match(result.epaNarrative, /Secondary Maximum Contaminant Level/)
  assert.doesNotMatch(result.epaNarrative, /safety limit/i)
  assert.doesNotMatch(result.epaNarrative, /health limit/i)
})

test('tap reading above the HRW quarterly range', () => {
  const result = interpretTdsReading('600', 'tap')
  assert.equal(result.valid, true)
  if (!result.valid) return
  assert.equal(result.vsHrw, 'above')
  assert.equal(result.vsEpa, 'above')
  assert.equal(result.escalate, true)
  assert.match(result.hrwNarrative, /outside/)
  assert.match(result.epaNarrative, /above EPA’s 500 mg\/L secondary\/aesthetic guideline/)
  assert.doesNotMatch(result.epaNarrative, /\bunsafe\b/i)
})

test('tap reading below the EPA SMCL', () => {
  const result = interpretTdsReading('499', 'tap')
  assert.equal(result.valid, true)
  if (!result.valid) return
  assert.equal(result.vsEpa, 'below')
  assert.equal(result.epaSmcl, EPA_TDS_SMCL_MG_L)
  assert.match(result.epaNarrative, /below EPA’s 500 mg\/L Secondary Maximum Contaminant Level/)
})

test('tap reading exactly at the EPA SMCL', () => {
  const result = interpretTdsReading('500', 'tap')
  assert.equal(result.valid, true)
  if (!result.valid) return
  assert.equal(result.vsEpa, 'at')
  assert.equal(result.vsHrw, 'within')
  assert.match(result.epaNarrative, /at EPA’s 500 mg\/L Secondary Maximum Contaminant Level/)
  assert.doesNotMatch(result.epaNarrative, /above EPA/)
  assert.doesNotMatch(result.epaNarrative, /\bsafe\b/i)
})

test('tap reading above the EPA SMCL but still inside the HRW range', () => {
  const result = interpretTdsReading('520', 'tap')
  assert.equal(result.valid, true)
  if (!result.valid) return
  assert.equal(result.vsHrw, 'within')
  assert.equal(result.vsEpa, 'above')
  assert.equal(result.escalate, false)
  assert.match(result.epaNarrative, /above EPA’s 500 mg\/L secondary\/aesthetic guideline/)
  assert.match(result.epaNarrative, /not a health-based drinking-water limit/)
  assert.doesNotMatch(result.epaNarrative, /\bunsafe\b/i)
})

test('RO reading is not treated as a like-for-like HRW match', () => {
  const result = interpretTdsReading('12', 'ro')
  assert.equal(result.valid, true)
  if (!result.valid) return
  assert.equal(result.waterType, 'ro')
  assert.equal(result.vsHrw, 'below')
  assert.equal(result.escalate, false)
  assert.ok(result.roNarrative)
  assert.match(result.roNarrative, /Reverse osmosis is designed to reduce dissolved ions/)
  assert.match(result.roNarrative, /does NOT by itself prove/)
  assert.match(result.roNarrative, /PFAS, lead, or arsenic/)
  assert.match(result.headline, /RO-filtered/)
})

test('invalid input is rejected without changing the value', () => {
  const empty = interpretTdsReading('', 'tap')
  assert.equal(empty.valid, false)
  if (empty.valid) return
  assert.match(empty.error, /Enter your TDS reading/)

  const letters = interpretTdsReading('abc', 'tap')
  assert.equal(letters.valid, false)

  const negative = interpretTdsReading('-12', 'tap')
  assert.equal(negative.valid, false)

  const symbols = interpretTdsReading('340ppm', 'tap')
  assert.equal(symbols.valid, false)

  const tooHigh = interpretTdsReading(String(TDS_INPUT_MAX + 1), 'tap')
  assert.equal(tooHigh.valid, false)

  const preserved = interpretTdsReading('340.50', 'tap')
  assert.equal(preserved.valid, true)
  if (!preserved.valid) return
  assert.equal(preserved.displayReading, '340.50')
  assert.equal(preserved.reading, 340.5)
})
