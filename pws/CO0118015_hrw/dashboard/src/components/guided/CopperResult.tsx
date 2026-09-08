import { useId, useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Home,
  Scale,
  Table2,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import { PfasDialog } from '../pfas/PfasDialog'
import { CopperPathwayVisual } from './CopperPathwayVisual'
import {
  COPPER_COPY,
  COPPER_REGULATION,
  HRW_COPPER_LCR_PERIODS,
  copperComparison,
  deriveCopperTrend,
  formatPpm,
  mostRecentCopperPeriod,
  tapRangeText,
} from '../../lib/copperResult'
import { formatExtractDate } from '../../lib/pfasShowcase'
import { getSource, HRW_CONTACT } from '../../lib/sourceRegistry'
import type { PwsPayload } from '../../types/water'

type CopperDialog = 'copper' | 'standard' | 'trend' | 'periods'

export function CopperResult({
  utilityLabel,
  water,
  onBack,
}: {
  utilityLabel: string
  water: PwsPayload
  onBack: () => void
}) {
  const [dialog, setDialog] = useState<CopperDialog | null>(null)
  const [alOpen, setAlOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const alId = useId()
  const sourcesId = useId()
  const period = mostRecentCopperPeriod()
  const cmp = copperComparison(period)
  const trend = useMemo(() => deriveCopperTrend(), [])
  const extractDate = formatExtractDate(water.generated_at)
  const hrwCopper = getSource('hrw_lead_copper_sampling')
  const hrwReport = getSource('hrw_2026_ccr')
  const epaLcri = getSource('epa_lcri')
  const actionLevel = COPPER_REGULATION.currentActionLevelPpm
  const scalePct = Math.min(100, cmp.sharePct)

  return (
    <div className="metal-page pfas-page copper-page pfas-enter min-h-svh font-sans">
      <a href="#copper-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />
      <main id="copper-main" className="pfas-main">
        <div className="pfas-shell">
          <div className="pfas-main-col">
            <button type="button" className="obs-back pfas-back" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to contaminants
            </button>
            <header className="pfas-title-block">
              <span className="pfas-title-icon copper-title-icon" aria-hidden>
                Cu
              </span>
              <div>
                <h1 className="pfas-title">{COPPER_COPY.title}</h1>
                <p className="pfas-subtitle">{COPPER_COPY.subtitle}</p>
              </div>
            </header>
            <CopperPathwayVisual />
            <section className="pfas-card pfas-answer" aria-labelledby="copper-compare-heading">
              <div className="pfas-answer-body">
                <h2 id="copper-compare-heading" className="pfas-verdict-h">
                  <span className="pfas-verdict-mark" aria-hidden>
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <span className="pfas-verdict-text">{COPPER_COPY.verdict}</span>
                </h2>
                <p className="pfas-lede">
                  Highlands Ranch Water’s most recent {period.year} monitoring period reported a
                  90th-percentile copper result of{' '}
                  <strong>
                    {formatPpm(period.percentile90Ppm)} {period.unit}
                  </strong>
                  . The current EPA action level is {formatPpm(actionLevel)} {period.unit}.
                </p>
                <div className="pfas-latest">
                  <div>
                    <p className="pfas-stat-k">90th percentile</p>
                    <p className="pfas-metric">
                      {formatPpm(period.percentile90Ppm)}
                      <span>{period.unit}</span>
                    </p>
                    <p className="pfas-meta">{period.shortLabel} result</p>
                  </div>
                  <div>
                    <p className="pfas-stat-k">{COPPER_REGULATION.currentRuleLabel}</p>
                    <p className="pfas-metric">
                      {formatPpm(actionLevel)}
                      <span>{period.unit}</span>
                    </p>
                    <p className="pfas-meta">For copper ({COPPER_REGULATION.currentRuleName})</p>
                    <button
                      type="button"
                      className="pfas-text-link"
                      aria-expanded={alOpen}
                      aria-controls={alId}
                      onClick={() => setAlOpen((open) => !open)}
                    >
                      What is an action level?
                    </button>
                    <p id={alId} hidden={!alOpen} className="pfas-copy">
                      {COPPER_COPY.actionLevelHelp}
                    </p>
                  </div>
                  <div className="pfas-compare-col">
                    <p className="pfas-stat-k">How it compares</p>
                    <p className="pfas-metric pfas-metric--ok">
                      {cmp.sharePct}%
                      <span>of the current action level</span>
                    </p>
                    <div
                      className="pfas-scale"
                      role="img"
                      aria-label={`${formatPpm(period.percentile90Ppm)} ${period.unit} is ${cmp.sharePct} percent of the current ${formatPpm(actionLevel)} ${period.unit} EPA copper action level`}
                    >
                      <div className="pfas-scale__track">
                        <div className="pfas-scale__fill" style={{ width: `${scalePct}%` }} />
                        <span className="pfas-scale__dot" style={{ left: `${scalePct}%` }} />
                        <span className="pfas-scale__mcl" aria-hidden />
                      </div>
                      <div className="pfas-scale__labels">
                        <span>0 {period.unit}</span>
                        <span>
                          Action level {formatPpm(actionLevel)} {period.unit}
                        </span>
                      </div>
                    </div>
                    <p className="pfas-scale__caption">
                      {cmp.sharePct}% of the current EPA action level — a comparison, not a safety
                      or risk score.
                    </p>
                  </div>
                </div>
                <div className="pfas-high">
                  <div>
                    <p className="pfas-stat-k">Sites above the action level</p>
                    <p className="pfas-high__v">
                      {period.sitesAboveActionLevel} of {period.sampleSize}
                    </p>
                  </div>
                  <p className="pfas-copy">
                    {period.sitesAboveActionLevel} of {period.sampleSize} sampled sites were above
                    the {formatPpm(actionLevel)} {period.unit} action level. Tap samples in this
                    period ranged from {tapRangeText(period)}. {COPPER_COPY.sitesExplain}
                  </p>
                </div>
                <div className="pfas-note">
                  <p>
                    Most recent official HRW monitoring period: {period.shortLabel}. No action-level
                    exceedance.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="pfas-side-col" aria-labelledby="copper-context-heading">
            <section className="lead-context" aria-labelledby="copper-context-heading">
              <h2 id="copper-context-heading" className="lead-context__h">
                <span className="lead-context__icon" aria-hidden>
                  <Home className="h-5 w-5" />
                </span>
                {COPPER_COPY.householdHeading}
              </h2>
              {COPPER_COPY.householdBody.map((para) => (
                <p key={para.slice(0, 32)} className="pfas-copy">
                  {para}
                </p>
              ))}
              <div className="lead-inventory">
                <span className="lead-inventory__mark" aria-hidden>
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <p className="lead-inventory__name">{COPPER_COPY.inventoryName}</p>
                  <p className="pfas-copy">{COPPER_COPY.inventoryStatus}</p>
                </div>
              </div>
              <a className="pfas-video-btn" href={hrwCopper.url} target="_blank" rel="noreferrer">
                HRW lead and copper sampling
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
            <section className="lead-update" aria-labelledby="copper-update-heading">
              <h2 id="copper-update-heading" className="lead-update__h">
                <span className="lead-update__icon" aria-hidden>
                  <Calendar className="h-4 w-4" />
                </span>
                {COPPER_COPY.ruleUpdateHeading}
              </h2>
              <div className="lead-update__pair">
                <div>
                  <p className="pfas-stat-k">Action level</p>
                  <p className="lead-update__v">
                    {formatPpm(COPPER_REGULATION.currentActionLevelPpm)}{' '}
                    <span>{COPPER_REGULATION.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="pfas-stat-k">MCLG</p>
                  <p className="lead-update__v">
                    {formatPpm(COPPER_REGULATION.currentMclgPpm)}{' '}
                    <span>{COPPER_REGULATION.unit}</span>
                  </p>
                </div>
              </div>
              <p className="pfas-copy">{COPPER_COPY.ruleUpdateBody}</p>
              <a className="pfas-text-link" href={epaLcri.url} target="_blank" rel="noreferrer">
                {epaLcri.shortLabel}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
          </aside>

          <section className="pfas-explore" aria-labelledby="copper-explore-heading">
            <h2 id="copper-explore-heading" className="pfas-sec-h">
              What would you like to explore?
            </h2>
            <ul className="pfas-actions-grid">
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <h3>Has copper changed over time?</h3>
                  <p>See official 2024 and 2025 Lead and Copper Rule monitoring periods.</p>
                  <button type="button" onClick={() => setDialog('trend')}>
                    View available measurements
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <Table2 className="h-4 w-4" />
                  </span>
                  <h3>What did monitoring find?</h3>
                  <p>See sample counts, ranges, and sites above the action level.</p>
                  <button type="button" onClick={() => setDialog('periods')}>
                    View monitoring details
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <Scale className="h-4 w-4" />
                  </span>
                  <h3>How does the action level work?</h3>
                  <p>Learn why copper uses an action level, not a simple MCL.</p>
                  <button type="button" onClick={() => setDialog('standard')}>
                    Explain the standard
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h3>What is copper?</h3>
                  <p>Learn why household plumbing can change the result at your faucet.</p>
                  <button type="button" onClick={() => setDialog('copper')}>
                    Learn about copper
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
            </ul>
          </section>

          <section className="pfas-questions" aria-labelledby="copper-questions-heading">
            <h2 id="copper-questions-heading" className="pfas-sec-h">
              Still have questions?
            </h2>
            <div className="pfas-q-links">
              <a className="metal-ext" href={hrwCopper.url} target="_blank" rel="noreferrer">
                Highlands Ranch Water lead and copper information
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="metal-ext" href={epaLcri.url} target="_blank" rel="noreferrer">
                EPA: Lead and Copper Rule
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="pfas-text-link" href={HRW_CONTACT.phoneHref}>
                Contact Highlands Ranch Water
              </a>
            </div>
          </section>

          <section className="pfas-sources" aria-labelledby="copper-sources-heading">
            <h2 id="copper-sources-heading" className="sr-only">
              Sources
            </h2>
            <button
              type="button"
              className="pfas-acc"
              aria-expanded={sourcesOpen}
              aria-controls={sourcesId}
              onClick={() => setSourcesOpen((open) => !open)}
            >
              Sources & limitations
              <ChevronDown className={`h-5 w-5 ${sourcesOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            <div id={sourcesId} hidden={!sourcesOpen} className="pfas-acc-panel">
              <dl className="pfas-fresh">
                <div>
                  <dt>Data</dt>
                  <dd>{cmp.reportLabel}</dd>
                </div>
                <div>
                  <dt>Measurement period</dt>
                  <dd>Most recent official period: {period.label}</dd>
                </div>
                {extractDate ? (
                  <div>
                    <dt>WaterLens extract generated</dt>
                    <dd>{extractDate}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>WaterLens limitation</dt>
                  <dd>{COPPER_COPY.limitation}</dd>
                </div>
              </dl>
              <ul className="pfas-source-list">
                {COPPER_COPY.footerCitations.map((citation) => {
                  const source = getSource(citation.id)
                  return (
                    <li key={citation.id}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </div>
      </main>

      {dialog === 'copper' ? (
        <PfasDialog title="What is copper?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{COPPER_COPY.subtitle}</p>
          {COPPER_COPY.householdBody.map((para) => (
            <p key={para.slice(0, 24)} className="pfas-copy">
              {para}
            </p>
          ))}
        </PfasDialog>
      ) : null}
      {dialog === 'standard' ? (
        <PfasDialog title="How does the action level work?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{COPPER_COPY.actionLevelHelp}</p>
          <p className="pfas-copy">{COPPER_COPY.percentileHelp}</p>
          <p className="pfas-copy">{COPPER_COPY.ruleUpdateBody}</p>
        </PfasDialog>
      ) : null}
      {dialog === 'trend' || dialog === 'periods' ? (
        <PfasDialog
          title={dialog === 'trend' ? 'Has copper changed over time?' : 'What did monitoring find?'}
          onClose={() => setDialog(null)}
        >
          <p className="pfas-copy">{dialog === 'trend' ? COPPER_COPY.chartNote : `${cmp.reportLabel}.`}</p>
          <div className="lead-dialog-table-wrap">
            <table className="lead-dialog-table">
              <caption className="sr-only">Official copper 90th-percentile results</caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">90th percentile</th>
                  <th scope="col">Sites above AL</th>
                  <th scope="col">Tap range</th>
                </tr>
              </thead>
              <tbody>
                {HRW_COPPER_LCR_PERIODS.map((row) => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td>
                      {formatPpm(row.percentile90Ppm)} {row.unit}
                    </td>
                    <td>
                      {row.sitesAboveActionLevel} of {row.sampleSize}
                    </td>
                    <td>{tapRangeText(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dialog === 'trend' ? <p className="pfas-copy">{trend.message}</p> : null}
          <a className="metal-ext" href={hrwReport.url} target="_blank" rel="noreferrer">
            {hrwReport.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}
    </div>
  )
}
