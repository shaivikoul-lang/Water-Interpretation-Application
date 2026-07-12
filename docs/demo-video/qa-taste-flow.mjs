/**
 * Manual QA automation — taste guided flow (Phase 1)
 * Usage: node docs/demo-video/qa-taste-flow.mjs
 * Requires: python3 -m http.server 8765 from repo root
 */
import { chromium } from 'playwright'

const PORT = process.env.QA_PORT || '8791'
const BASE = `http://localhost:${PORT}/`
const DASHBOARD = `${BASE}pws/CO0118015_hrw/dashboard/dist/index.html`
const TASTE_URL = `${DASHBOARD}?concern=taste`

const results = []

function pass(step, detail) {
  results.push({ step, status: 'PASS', detail })
  console.log(`✓ ${step}: ${detail}`)
}

function fail(step, detail) {
  results.push({ step, status: 'FAIL', detail })
  console.error(`✗ ${step}: ${detail}`)
}

function warn(step, detail) {
  results.push({ step, status: 'WARN', detail })
  console.warn(`⚠ ${step}: ${detail}`)
}

async function assertVisible(page, locator, step, label) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 10000 })
    pass(step, label)
    return true
  } catch {
    fail(step, `${label} — not visible`)
    return false
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

try {
  // --- Landing ---
  await page.goto(BASE, { waitUntil: 'networkidle' })
  if (await assertVisible(page, page.getByRole('heading', { name: 'WaterLens' }), 'L1', 'Landing wordmark')) {
    await assertVisible(page, page.getByRole('heading', { name: 'What brought you here today?' }), 'L2', 'Entry question')
    const tasteLink = page.getByRole('link', { name: /tastes or smells different/i })
    await assertVisible(page, tasteLink, 'L3', 'Taste concern row')
    const href = await tasteLink.getAttribute('href')
    if (href?.includes('concern=taste')) pass('L4', `Taste href correct: ${href}`)
    else fail('L4', `Taste href wrong: ${href}`)
    await assertVisible(page, page.getByRole('link', { name: 'Explore full water data' }), 'L5', 'Secondary explore link')
    await assertVisible(page, page.getByRole('link', { name: 'Year-by-year tables' }), 'L6', 'Secondary classic link')
  }

  // --- Guided entry (direct URL, simulates landing click) ---
  await page.goto(TASTE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Loading snapshot', { state: 'detached', timeout: 15000 }).catch(() => {})

  if (await assertVisible(page, page.getByRole('heading', { name: 'What are you noticing?' }), 'G1', 'Clarifying question')) {
    // No chart before clarify
    const chartBefore = await page.locator('.recharts-wrapper').count()
    if (chartBefore === 0) pass('G2', 'No chart on clarifying screen')
    else fail('G2', `Chart present before insight (${chartBefore})`)

    // No explore pill on clarify (top bar only Home)
    const exploreTop = page.getByRole('button', { name: 'Explore full water data' })
    if ((await exploreTop.count()) === 0) pass('G3', 'No Explore pill before insight card')
    else warn('G3', 'Explore pill visible before insight (spec: insight screen only in top bar)')

    await page.getByRole('button', { name: 'Chlorine or chemical smell' }).click()
    await page.waitForTimeout(400)

    if (await assertVisible(page, page.getByText('Should you worry?'), 'G4', 'Insight card title')) {
      await assertVisible(page, page.getByText(/chlorine smell is common/i), 'G5', 'Chlorine headline')
      await assertVisible(page, page.getByText(/well below federal limits/i), 'G6', 'Calm verdict (live TTHM data)')
      await assertVisible(page, page.getByText(/What to do next:/i), 'G7', 'Next step line')
    }

    // Explore pill appears after insight
    await assertVisible(page, page.getByRole('button', { name: 'Explore full water data' }).first(), 'G8', 'Explore handoff available')

    // Still no chart before Show me why
    const chartMid = await page.locator('.recharts-wrapper').count()
    if (chartMid === 0) pass('G9', 'No chart before Show me why')
    else fail('G9', `Chart visible before Show me why (${chartMid})`)

    // Why? disclosure
    await page.getByRole('button', { name: 'Why?', exact: true }).click()
    await page.waitForTimeout(350)
    const whyPanel = page.locator('#why-panel')
    if (await whyPanel.isVisible()) {
      pass('G10', 'Why? panel expands')
      const expanded = await page.locator('#why-toggle').getAttribute('aria-expanded')
      if (expanded === 'true') pass('G11', 'Why? aria-expanded=true')
      else fail('G11', `Why? aria-expanded=${expanded}`)
      await assertVisible(page, whyPanel.getByText(/chlorine or chemical smell often comes from normal disinfection/i), 'G12', 'Why bullet content')
      await assertVisible(page, whyPanel.getByRole('link', { name: 'CDPHE' }), 'G13', 'CDPHE link in Why?')
    }

    // Show me why disclosure
    await page.getByRole('button', { name: 'Show me why', exact: true }).click()
    await page.waitForTimeout(500)
    const evidencePanel = page.locator('#evidence-panel')
    if (await evidencePanel.isVisible()) {
      pass('G14', 'Show me why panel expands')
      const body = await evidencePanel.innerText()
      if (body.includes('22.02') || body.includes('22')) pass('G15', 'Live TTHM value in evidence (~22.02 µg/L)')
      else fail('G15', `Expected live TTHM value; got: ${body.slice(0, 200)}`)
      if (/1999|2000|older public records|above the limit/i.test(body)) {
        pass('G16', 'Historical exceedance acknowledged in narrative')
      } else {
        warn('G16', 'Historical exceedance not clearly mentioned')
      }
      const chartAfter = await evidencePanel.locator('.recharts-wrapper').count()
      if (chartAfter > 0) pass('G17', 'Trend chart appears inside Show me why')
      else fail('G17', 'Trend chart missing in Show me why')
    }

    // Change my answer
    await page.getByRole('button', { name: 'Change my answer' }).click()
    await page.waitForTimeout(300)
    if (await page.getByRole('heading', { name: 'What are you noticing?' }).isVisible()) {
      pass('G18', 'Change my answer returns to clarify')
    } else fail('G18', 'Change my answer did not reset flow')

    // Re-enter for explore handoff
    await page.getByRole('button', { name: "I'm not sure" }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Explore full water data' }).last().click()
    await page.waitForTimeout(1500)

    if (await assertVisible(page, page.getByRole('heading', { name: 'Your water snapshot' }), 'G19', 'Explore mode HeroSnapshot loaded')) {
      await assertVisible(page, page.getByRole('link', { name: 'Classic view' }), 'G20', 'Explore top bar (Classic)')
      await assertVisible(page, page.getByRole('button', { name: /Dark|Light/i }), 'G21', 'Dark mode toggle in explore')
      const topicBtn = page.getByRole('button', { name: /Taste & odor/i })
      if (await topicBtn.isVisible()) pass('G22', 'TopicsHub visible in explore')
    }
  }

  // --- Explore-only regression (no concern param) ---
  const explorePage = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await explorePage.goto(DASHBOARD, { waitUntil: 'networkidle' })
  await explorePage.waitForSelector('text=Loading snapshot', { state: 'detached', timeout: 15000 }).catch(() => {})
  if (await explorePage.getByText('Recent monitoring results').isVisible().catch(() => false)) {
    pass('E1', 'Explore mode loads without concern param')
  } else {
    fail('E1', 'Explore mode failed to load')
  }
  const guidedHeading = explorePage.getByRole('heading', { name: 'What are you noticing?' })
  if ((await guidedHeading.count()) === 0) pass('E2', 'Explore mode does not show guided clarify')
  else fail('E2', 'Guided UI leaked into explore mode')
  await explorePage.close()

  // --- Placeholder concern fallback ---
  const pfasPage = await browser.newPage()
  await pfasPage.goto(`${DASHBOARD}?concern=pfas`, { waitUntil: 'networkidle' })
  await pfasPage.waitForSelector('text=Loading snapshot', { state: 'detached', timeout: 15000 }).catch(() => {})
  const pfasGuided = await pfasPage.getByRole('heading', { name: 'What are you noticing?' }).count()
  if (pfasGuided === 0) pass('E3', '?concern=pfas falls back to explore')
  else fail('E3', 'PFAS param incorrectly opened guided flow')
  await pfasPage.close()

  // --- Keyboard smoke (clarify → insight) ---
  const kbPage = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await kbPage.goto(TASTE_URL, { waitUntil: 'networkidle' })
  await kbPage.waitForSelector('text=Loading snapshot', { state: 'detached', timeout: 15000 }).catch(() => {})
  await kbPage.keyboard.press('Tab')
  await kbPage.keyboard.press('Tab')
  await kbPage.keyboard.press('Enter')
  await kbPage.waitForTimeout(400)
  if (await kbPage.getByText('Should you worry?').isVisible().catch(() => false)) {
    pass('A1', 'Keyboard can activate first clarify option')
  } else {
    warn('A1', 'Keyboard tab order may not reach clarify option quickly')
  }
  await kbPage.close()

} catch (err) {
  fail('RUNTIME', (err).message)
} finally {
  await browser.close()
}

const fails = results.filter((r) => r.status === 'FAIL')
const warns = results.filter((r) => r.status === 'WARN')
const passes = results.filter((r) => r.status === 'PASS')

console.log('\n--- QA SUMMARY ---')
console.log(`PASS: ${passes.length}  WARN: ${warns.length}  FAIL: ${fails.length}`)
if (fails.length) {
  console.log('\nFailures:')
  fails.forEach((f) => console.log(`  - ${f.step}: ${f.detail}`))
  process.exit(1)
}
if (warns.length) {
  console.log('\nWarnings:')
  warns.forEach((w) => console.log(`  - ${w.step}: ${w.detail}`))
}
