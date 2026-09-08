import { useId, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Info,
  Mountain,
  Scale,
  Table2,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import { PfasDialog } from '../pfas/PfasDialog'
import { LithiumPathwayVisual } from './LithiumPathwayVisual'
import {
  HRW_LITHIUM_UCMR_YEARS,
  LITHIUM_COPY,
  LITHIUM_REGULATION,
  formatPpb,
  lithiumComparison,
  mostRecentLithiumYear,
} from '../../lib/lithiumResult'
import { formatExtractDate } from '../../lib/pfasShowcase'
import { getSource, HRW_CONTACT } from '../../lib/sourceRegistry'
import type { PwsPayload } from '../../types/water'

type LithiumDialog = 'lithium' | 'standard' | 'trend' | 'monitoring'

export function LithiumResult({
  utilityLabel,
  water,
  onBack,
}: {
  utilityLabel: string
  water: PwsPayload
  onBack: () => void
}) {
  const [dialog, setDialog] = useState<LithiumDialog | null>(null)
  const [hrlOpen, setHrlOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const hrlId = useId()
  const sourcesId = useId()
  const year = mostRecentLithiumYear()
  const cmp = lithiumComparison(year)
  const extractDate = formatExtractDate(water.generated_at)
  const hrwReport = getSource('hrw_2025_ccr')
  const epaUcmr = getSource('epa_ucmr5')
  const epaLithium = getSource('epa_lithium_factsheet')
  const scalePct = Math.min(100, cmp.sharePct)

  return (
    <div className="metal-page pfas-page lithium-page pfas-enter min-h-svh font-sans">
      <a href="#lithium-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />
      <main id="lithium-main" className="pfas-main">
        <div className="pfas-shell">
          <div className="pfas-main-col">
            <button type="button" className="obs-back pfas-back" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to contaminants
            </button>
            <header className="pfas-title-block">
              <span className="pfas-title-icon lithium-title-icon" aria-hidden>
                Li
              </span>
              <div>
                <h1 className="pfas-title">{LITHIUM_COPY.title}</h1>
                <p className="pfas-subtitle">{LITHIUM_COPY.subtitle}</p>
              </div>
            </header>
            <LithiumPathwayVisual />
            <section className="pfas-card pfas-answer" aria-labelledby="lithium-compare-heading">
              <div className="pfas-answer-body">
                <h2 id="lithium-compare-heading" className="pfas-verdict-h">
                  <span className="pfas-verdict-mark pfas-verdict-mark--watch" aria-hidden>
                    <Info className="h-7 w-7" strokeWidth={2.5} />
                  </span>
                  <span className="pfas-verdict-text">{LITHIUM_COPY.verdict}</span>
                </h2>
                <p className="pfas-lede">
                  Highlands Ranch Water’s official UCMR 5 monitoring reported an average lithium
                  result of{' '}
                  <strong>
                    {formatPpb(year.averagePpb)} {year.unit}
                  </strong>
                  . EPA has not set a Maximum Contaminant Level for lithium.
                </p>
                <div className="pfas-latest">
                  <div>
                    <p className="pfas-stat-k">Average</p>
                    <p className="pfas-metric">
                      {formatPpb(year.averagePpb)}
                      <span>{year.unit}</span>
                    </p>
                    <p className="pfas-meta">{year.shortLabel} UCMR 5 result</p>
                  </div>
                  <div>
                    <p className="pfas-stat-k">{LITHIUM_REGULATION.currentRuleLabel}</p>
                    <p className="pfas-metric">
                      {formatPpb(LITHIUM_REGULATION.hrlPpb)}
                      <span>{year.unit}</span>
                    </p>
                    <p className="pfas-meta">Screening only — not an MCL</p>
                    <button
                      type="button"
                      className="pfas-text-link"
                      aria-expanded={hrlOpen}
                      aria-controls={hrlId}
                      onClick={() => setHrlOpen((open) => !open)}
                    >
                      What is an HRL?
                    </button>
                    <p id={hrlId} hidden={!hrlOpen} className="pfas-copy">
                      {LITHIUM_COPY.hrlHelp}
                    </p>
                  </div>
                  <div className="pfas-compare-col">
                    <p className="pfas-stat-k">How it compares</p>
                    <p className="pfas-metric">
                      {cmp.sharePct}%
                      <span>of the screening HRL</span>
                    </p>
                    <div
                      className="pfas-scale"
                      role="img"
                      aria-label={`${formatPpb(year.averagePpb)} ${year.unit} is ${cmp.sharePct} percent of the ${formatPpb(LITHIUM_REGULATION.hrlPpb)} ${year.unit} EPA lithium Health Reference Level, which is not a legal limit`}
                    >
                      <div className="pfas-scale__track">
                        <div className="pfas-scale__fill pfas-scale__fill--watch" style={{ width: `${scalePct}%` }} />
                        <span className="pfas-scale__dot" style={{ left: `${scalePct}%` }} />
                        <span className="pfas-scale__mcl" aria-hidden />
                      </div>
                      <div className="pfas-scale__labels">
                        <span>0 {year.unit}</span>
                        <span>
                          Screening HRL {formatPpb(LITHIUM_REGULATION.hrlPpb)} {year.unit}
                        </span>
                      </div>
                    </div>
                    <p className="pfas-scale__caption">
                      {cmp.sharePct}% of EPA’s screening HRL — not a violation and not a safety
                      score.
                    </p>
                  </div>
                </div>
                <div className="pfas-high">
                  <div>
                    <p className="pfas-stat-k">Highest reported</p>
                    <p className="pfas-high__v">
                      {formatPpb(year.rangeHighPpb)} {year.unit}
                    </p>
                  </div>
                  <p className="pfas-copy">
                    Samples ranged from {year.rangeLowLabel} to {formatPpb(year.rangeHighPpb)}{' '}
                    {year.unit}. {year.sampleSize} entry-point samples were reported.{' '}
                    {LITHIUM_COPY.samplesExplain}
                  </p>
                </div>
                <div className="pfas-note">
                  <p>Official HRW UCMR 5 year: {year.shortLabel}. No MCL applies.</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="pfas-side-col" aria-labelledby="lithium-context-heading">
            <section className="lead-context" aria-labelledby="lithium-context-heading">
              <h2 id="lithium-context-heading" className="lead-context__h">
                <span className="lead-context__icon" aria-hidden>
                  <Mountain className="h-5 w-5" />
                </span>
                {LITHIUM_COPY.sourceHeading}
              </h2>
              {LITHIUM_COPY.sourceBody.map((para) => (
                <p key={para.slice(0, 32)} className="pfas-copy">
                  {para}
                </p>
              ))}
              <div className="lead-inventory">
                <span className="lead-inventory__mark" aria-hidden>
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <p className="lead-inventory__name">{LITHIUM_COPY.sourceName}</p>
                  <p className="pfas-copy">{LITHIUM_COPY.ucmrHelp}</p>
                </div>
              </div>
              <a className="pfas-video-btn" href={hrwReport.url} target="_blank" rel="noreferrer">
                HRW 2025 Water Quality Report
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
            <section className="lead-update" aria-labelledby="lithium-update-heading">
              <h2 id="lithium-update-heading" className="lead-update__h">
                <span className="lead-update__icon" aria-hidden>
                  <Calendar className="h-4 w-4" />
                </span>
                {LITHIUM_COPY.ruleUpdateHeading}
              </h2>
              <div className="lead-update__pair">
                <div>
                  <p className="pfas-stat-k">Screening HRL</p>
                  <p className="lead-update__v">
                    {formatPpb(LITHIUM_REGULATION.hrlPpb)} <span>{LITHIUM_REGULATION.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="pfas-stat-k">UCMR MRL</p>
                  <p className="lead-update__v">
                    {formatPpb(LITHIUM_REGULATION.mrlPpb)} <span>{LITHIUM_REGULATION.unit}</span>
                  </p>
                </div>
              </div>
              <p className="pfas-copy">{LITHIUM_COPY.ruleUpdateBody}</p>
              <a className="pfas-text-link" href={epaLithium.url} target="_blank" rel="noreferrer">
                {epaLithium.shortLabel}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
          </aside>

          <section className="pfas-explore" aria-labelledby="lithium-explore-heading">
            <h2 id="lithium-explore-heading" className="pfas-sec-h">
              What would you like to explore?
            </h2>
            <ul className="pfas-actions-grid">
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <h3>Has lithium changed over time?</h3>
                  <p>See the official UCMR 5 result and why extract history is not available.</p>
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
                  <p>See the sample count, range, and official average.</p>
                  <button type="button" onClick={() => setDialog('monitoring')}>
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
                  <h3>How does the screening level work?</h3>
                  <p>Learn why lithium has an HRL but no federal MCL.</p>
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
                  <h3>What is lithium?</h3>
                  <p>Learn why this is a geology and source-water story.</p>
                  <button type="button" onClick={() => setDialog('lithium')}>
                    Learn about lithium
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
            </ul>
          </section>

          <section className="pfas-questions" aria-labelledby="lithium-questions-heading">
            <h2 id="lithium-questions-heading" className="pfas-sec-h">
              Still have questions?
            </h2>
            <div className="pfas-q-links">
              <a className="metal-ext" href={hrwReport.url} target="_blank" rel="noreferrer">
                Highlands Ranch Water 2025 Water Quality Report
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="metal-ext" href={epaUcmr.url} target="_blank" rel="noreferrer">
                EPA: UCMR 5
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="pfas-text-link" href={HRW_CONTACT.phoneHref}>
                Contact Highlands Ranch Water
              </a>
            </div>
          </section>

          <section className="pfas-sources" aria-labelledby="lithium-sources-heading">
            <h2 id="lithium-sources-heading" className="sr-only">
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
                  <dd>EPA UCMR 5 and CCL 5 lithium Health Reference Level</dd>
                </div>
                {extractDate ? (
                  <div>
                    <dt>WaterLens extract generated</dt>
                    <dd>{extractDate}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>WaterLens limitation</dt>
                  <dd>{LITHIUM_COPY.limitation}</dd>
                </div>
              </dl>
              <ul className="pfas-source-list">
                {LITHIUM_COPY.footerCitations.map((citation) => {
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

      {dialog === 'lithium' ? (
        <PfasDialog title="What is lithium?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{LITHIUM_COPY.subtitle}</p>
          {LITHIUM_COPY.sourceBody.map((para) => (
            <p key={para.slice(0, 24)} className="pfas-copy">
              {para}
            </p>
          ))}
        </PfasDialog>
      ) : null}
      {dialog === 'standard' ? (
        <PfasDialog title="How does the screening level work?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{LITHIUM_COPY.hrlHelp}</p>
          <p className="pfas-copy">{LITHIUM_COPY.ucmrHelp}</p>
          <p className="pfas-copy">{LITHIUM_COPY.ruleUpdateBody}</p>
          <a className="metal-ext" href={epaLithium.url} target="_blank" rel="noreferrer">
            {epaLithium.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}
      {dialog === 'trend' || dialog === 'monitoring' ? (
        <PfasDialog
          title={dialog === 'trend' ? 'Has lithium changed over time?' : 'What did monitoring find?'}
          onClose={() => setDialog(null)}
        >
          <p className="pfas-copy">{LITHIUM_COPY.chartNote}</p>
          <div className="lead-dialog-table-wrap">
            <table className="lead-dialog-table">
              <caption className="sr-only">Official HRW UCMR 5 lithium results</caption>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Average</th>
                  <th scope="col">Range</th>
                  <th scope="col">Samples</th>
                </tr>
              </thead>
              <tbody>
                {HRW_LITHIUM_UCMR_YEARS.map((row) => (
                  <tr key={row.id}>
                    <td>{row.shortLabel}</td>
                    <td>
                      {formatPpb(row.averagePpb)} {row.unit}
                    </td>
                    <td>
                      {row.rangeLowLabel}–{formatPpb(row.rangeHighPpb)} {row.unit}
                    </td>
                    <td>{row.sampleSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
