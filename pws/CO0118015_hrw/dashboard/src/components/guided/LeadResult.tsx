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
import { LeadPathwayVisual } from './LeadPathwayVisual'
import {
  deriveLeadTrend,
  formatPpb,
  HRW_LEAD_LCR_PERIODS,
  HRW_LEAD_SERVICE_LINES,
  LEAD_COPY,
  LEAD_REGULATION,
  leadChartPoints,
  leadComparison,
  mostRecentLeadPeriod,
  sitesStatusText,
  tapRangeText,
} from '../../lib/leadResult'
import { formatExtractDate } from '../../lib/pfasShowcase'
import { getSource, HRW_CONTACT } from '../../lib/sourceRegistry'
import type { PwsPayload } from '../../types/water'

type LeadDialog = 'lead' | 'standard' | 'trend' | 'periods'

export function LeadResult({
  utilityLabel,
  water,
  onBack,
}: {
  utilityLabel: string
  water: PwsPayload
  onBack: () => void
}) {
  const [dialog, setDialog] = useState<LeadDialog | null>(null)
  const [alOpen, setAlOpen] = useState(false)
  const [percentileOpen, setPercentileOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const alId = useId()
  const percentileId = useId()
  const sourcesId = useId()
  const period = mostRecentLeadPeriod()
  const cmp = leadComparison(period)
  const points = useMemo(() => leadChartPoints(), [])
  const trend = useMemo(() => deriveLeadTrend(points), [points])
  const extractDate = formatExtractDate(water.generated_at)
  const hrwLead = getSource('hrw_lead_copper_sampling')
  const hrwReport = getSource('hrw_2025_ccr')
  const epaLead = getSource('epa_lead_drinking_water')
  const epaLcri = getSource('epa_lcri')
  const actionLevel = LEAD_REGULATION.currentActionLevelPpb
  const scalePct = Math.min(100, cmp.sharePct)

  return (
    <div className="metal-page pfas-page lead-page pfas-enter min-h-svh font-sans">
      <a href="#lead-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="lead-main" className="pfas-main">
        <div className="pfas-shell">
          <div className="pfas-main-col">
            <button type="button" className="obs-back pfas-back" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to contaminants
            </button>
            <header className="pfas-title-block">
              <span className="pfas-title-icon lead-title-icon" aria-hidden>
                Pb
              </span>
              <div>
                <h1 className="pfas-title">{LEAD_COPY.title}</h1>
                <p className="pfas-subtitle">{LEAD_COPY.subtitle}</p>
              </div>
            </header>

            <LeadPathwayVisual />

            <section className="pfas-card pfas-answer" aria-labelledby="lead-compare-heading">
              <div className="pfas-answer-body">
                <h2 id="lead-compare-heading" className="pfas-verdict-h">
                  <span className="pfas-verdict-mark" aria-hidden>
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <span className="pfas-verdict-text">{LEAD_COPY.verdict}</span>
                </h2>
                <p className="pfas-lede">
                  Highlands Ranch Water’s most recent {period.year} monitoring period reported a
                  90th-percentile lead result of{' '}
                  <strong>
                    {formatPpb(period.percentile90Ppb)} {period.unit}
                  </strong>
                  . The current EPA action level is {formatPpb(actionLevel)} {period.unit}.
                </p>

                <div className="pfas-latest">
                  <div>
                    <p className="pfas-stat-k">90th percentile</p>
                    <p className="pfas-metric">
                      {formatPpb(period.percentile90Ppb)}
                      <span>{period.unit}</span>
                    </p>
                    <p className="pfas-meta">{period.shortLabel} result</p>
                  </div>
                  <div>
                    <p className="pfas-stat-k">{LEAD_REGULATION.currentRuleLabel}</p>
                    <p className="pfas-metric">
                      {formatPpb(actionLevel)}
                      <span>{period.unit}</span>
                    </p>
                    <p className="pfas-meta">For lead ({LEAD_REGULATION.currentRuleName})</p>
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
                      {LEAD_COPY.actionLevelIsNotMcl}
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
                      aria-label={`${formatPpb(period.percentile90Ppb)} ${period.unit} is ${cmp.sharePct} percent of the current ${formatPpb(actionLevel)} ${period.unit} EPA lead action level`}
                    >
                      <div className="pfas-scale__track">
                        <div className="pfas-scale__fill" style={{ width: `${scalePct}%` }} />
                        <span className="pfas-scale__dot" style={{ left: `${scalePct}%` }} />
                        <span className="pfas-scale__mcl" aria-hidden />
                      </div>
                      <div className="pfas-scale__labels">
                        <span>0 {period.unit}</span>
                        <span>
                          Action level {formatPpb(actionLevel)} {period.unit}
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
                    {sitesStatusText(period)} Tap samples in this period ranged from{' '}
                    {tapRangeText(period)}. {LEAD_COPY.sitesExplain}
                  </p>
                </div>

                <div className="pfas-note">
                  <p>
                    Most recent HRW monitoring period: {period.shortLabel}. No action-level
                    exceedance.
                  </p>
                  <button
                    type="button"
                    className="pfas-text-link"
                    aria-expanded={percentileOpen}
                    aria-controls={percentileId}
                    onClick={() => setPercentileOpen((open) => !open)}
                  >
                    What does the 90th percentile mean?
                  </button>
                  <p id={percentileId} hidden={!percentileOpen} className="pfas-copy">
                    {LEAD_COPY.percentileHelp} For this period the 90th percentile is{' '}
                    {formatPpb(period.percentile90Ppb)} {period.unit}.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="pfas-side-col" aria-labelledby="lead-context-heading">
            <section className="lead-context" aria-labelledby="lead-context-heading">
              <h2 id="lead-context-heading" className="lead-context__h">
                <span className="lead-context__icon" aria-hidden>
                  <Home className="h-5 w-5" />
                </span>
                {LEAD_COPY.householdHeading}
              </h2>
              {LEAD_COPY.householdBody.map((para) => (
                <p key={para.slice(0, 32)} className="pfas-copy">
                  {para}
                </p>
              ))}
              <div className="lead-inventory">
                <span className="lead-inventory__mark" aria-hidden>
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <p className="lead-inventory__name">{LEAD_COPY.inventoryName}</p>
                  <p className="pfas-copy">{HRW_LEAD_SERVICE_LINES.statusLead}</p>
                </div>
              </div>
              <a className="pfas-video-btn" href={hrwLead.url} target="_blank" rel="noreferrer">
                HRW lead and copper sampling
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>

            <section className="lead-update" aria-labelledby="lead-update-heading">
              <h2 id="lead-update-heading" className="lead-update__h">
                <span className="lead-update__icon" aria-hidden>
                  <Calendar className="h-4 w-4" />
                </span>
                {LEAD_COPY.ruleUpdateHeading}
              </h2>
              <div className="lead-update__pair">
                <div>
                  <p className="pfas-stat-k">Current</p>
                  <p className="lead-update__v">
                    {formatPpb(LEAD_REGULATION.currentActionLevelPpb)}{' '}
                    <span>{LEAD_REGULATION.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="pfas-stat-k">Beginning {LEAD_REGULATION.lcriEffectiveLabel}</p>
                  <p className="lead-update__v">
                    {formatPpb(LEAD_REGULATION.lcriActionLevelPpb)}{' '}
                    <span>{LEAD_REGULATION.unit}</span>
                  </p>
                </div>
              </div>
              <p className="pfas-copy">{LEAD_COPY.ruleUpdateBody}</p>
              <a className="pfas-text-link" href={epaLcri.url} target="_blank" rel="noreferrer">
                {epaLcri.shortLabel}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
          </aside>

          <section className="pfas-explore" aria-labelledby="lead-explore-heading">
            <h2 id="lead-explore-heading" className="pfas-sec-h">
              What would you like to explore?
            </h2>
            <ul className="pfas-actions-grid">
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <h3>Has lead changed over time?</h3>
                  <p>See the official 2024 Lead and Copper Rule monitoring periods.</p>
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
                  <p>See both 2024 periods, sample counts, and sites above the action level.</p>
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
                  <p>Learn why lead uses an action level, not a simple MCL.</p>
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
                  <h3>What is lead?</h3>
                  <p>Learn why household plumbing can change the result at your faucet.</p>
                  <button type="button" onClick={() => setDialog('lead')}>
                    Learn about lead
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
            </ul>
          </section>

          <section className="pfas-questions" aria-labelledby="lead-questions-heading">
            <h2 id="lead-questions-heading" className="pfas-sec-h">
              Still have questions?
            </h2>
            <div className="pfas-q-links">
              <a className="metal-ext" href={hrwLead.url} target="_blank" rel="noreferrer">
                Highlands Ranch Water lead information
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="metal-ext" href={epaLead.url} target="_blank" rel="noreferrer">
                EPA: lead in drinking water
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="pfas-text-link" href={HRW_CONTACT.phoneHref}>
                Contact Highlands Ranch Water
              </a>
            </div>
          </section>

          <section className="pfas-sources" aria-labelledby="lead-sources-heading">
            <h2 id="lead-sources-heading" className="sr-only">
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
                  <dt>Federal reference</dt>
                  <dd>U.S. Environmental Protection Agency Lead and Copper Rule</dd>
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
                  <dt>Action level</dt>
                  <dd>{LEAD_COPY.actionLevelIsNotMcl}</dd>
                </div>
                <div>
                  <dt>WaterLens limitation</dt>
                  <dd>{LEAD_COPY.limitation}</dd>
                </div>
              </dl>
              <ul className="pfas-source-list">
                {LEAD_COPY.footerCitations.map((citation) => {
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

      {dialog === 'lead' ? (
        <PfasDialog title="What is lead?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{LEAD_COPY.subtitle}</p>
          {LEAD_COPY.householdBody.map((para) => (
            <p key={para.slice(0, 24)} className="pfas-copy">
              {para}
            </p>
          ))}
          <ol className="lead-next-list">
            {LEAD_COPY.nextSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}.</strong> {step.body}
              </li>
            ))}
          </ol>
          <div className="pfas-q-links">
            <a className="metal-ext" href={hrwLead.url} target="_blank" rel="noreferrer">
              Highlands Ranch Water lead information
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="metal-ext" href={epaLead.url} target="_blank" rel="noreferrer">
              EPA: lead in drinking water
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </PfasDialog>
      ) : null}

      {dialog === 'standard' ? (
        <PfasDialog title="How does the action level work?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{LEAD_COPY.actionLevelIsNotMcl}</p>
          <p className="pfas-copy">{LEAD_COPY.percentileHelp}</p>
          <p className="pfas-copy">{LEAD_COPY.sitesExplain}</p>
          <p className="pfas-copy">{LEAD_COPY.ruleUpdateBody}</p>
          <a className="metal-ext" href={epaLcri.url} target="_blank" rel="noreferrer">
            {epaLcri.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}

      {dialog === 'trend' ? (
        <PfasDialog title="Has lead changed over time?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{LEAD_COPY.chartNote}</p>
          <div className="lead-dialog-table-wrap">
          <table className="lead-dialog-table">
            <caption className="sr-only">Official 90th-percentile lead results</caption>
            <thead>
              <tr>
                <th scope="col">Monitoring period</th>
                <th scope="col">90th percentile</th>
                <th scope="col">Samples</th>
              </tr>
            </thead>
            <tbody>
              {HRW_LEAD_LCR_PERIODS.map((row) => (
                <tr key={row.id}>
                  <td>{row.label}</td>
                  <td>
                    {formatPpb(row.percentile90Ppb)} {row.unit}
                  </td>
                  <td>{row.sampleSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <p className="pfas-copy">{trend.message}</p>
          <a className="metal-ext" href={hrwReport.url} target="_blank" rel="noreferrer">
            {hrwReport.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}

      {dialog === 'periods' ? (
        <PfasDialog title="What did monitoring find?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{cmp.reportLabel}.</p>
          <div className="lead-dialog-table-wrap">
          <table className="lead-dialog-table">
            <caption className="sr-only">Official 2024 Lead and Copper Rule periods</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">90th percentile</th>
                <th scope="col">Sites above action level</th>
                <th scope="col">Tap range</th>
              </tr>
            </thead>
            <tbody>
              {HRW_LEAD_LCR_PERIODS.map((row) => (
                <tr key={row.id}>
                  <td>{row.label}</td>
                  <td>
                    {formatPpb(row.percentile90Ppb)} {row.unit}
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
          <p className="pfas-copy">{LEAD_COPY.sitesExplain}</p>
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
