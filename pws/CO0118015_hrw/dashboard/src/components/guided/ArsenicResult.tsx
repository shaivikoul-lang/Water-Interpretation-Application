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
  Mountain,
  Scale,
  Table2,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import { PfasDialog } from '../pfas/PfasDialog'
import { ArsenicPathwayVisual } from './ArsenicPathwayVisual'
import {
  ARSENIC_COPY,
  ARSENIC_REGULATION,
  HRW_ARSENIC_CCR_META,
  HRW_ARSENIC_CCR_YEARS,
  arsenicComparison,
  cdpheArsenicYears,
  deriveArsenicTrend,
  formatExtractPpb,
  formatPpb,
  mostRecentArsenicYear,
  rangeText,
} from '../../lib/arsenicResult'
import { formatExtractDate } from '../../lib/pfasShowcase'
import { getSource, HRW_CONTACT } from '../../lib/sourceRegistry'
import type { PwsPayload } from '../../types/water'

type ArsenicDialog = 'arsenic' | 'standard' | 'trend' | 'monitoring'

export function ArsenicResult({
  utilityLabel,
  water,
  onBack,
}: {
  utilityLabel: string
  water: PwsPayload
  onBack: () => void
}) {
  const [dialog, setDialog] = useState<ArsenicDialog | null>(null)
  const [mclOpen, setMclOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const mclId = useId()
  const sourcesId = useId()
  const year = mostRecentArsenicYear()
  const cmp = arsenicComparison(year)
  const trend = useMemo(() => deriveArsenicTrend(), [])
  const extractYears = useMemo(() => cdpheArsenicYears(water), [water])
  const extractDate = formatExtractDate(water.generated_at)
  const hrwLatest = getSource('hrw_2026_ccr')
  const hrwPrior = getSource('hrw_2025_ccr')
  const epaArsenic = getSource('epa_arsenic_rule')
  const mcl = ARSENIC_REGULATION.mclPpb
  const scalePct = Math.min(100, cmp.sharePct)

  return (
    <div className="metal-page pfas-page arsenic-page pfas-enter min-h-svh font-sans">
      <a href="#arsenic-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="arsenic-main" className="pfas-main">
        <div className="pfas-shell">
          <div className="pfas-main-col">
            <button type="button" className="obs-back pfas-back" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to contaminants
            </button>
            <header className="pfas-title-block">
              <span className="pfas-title-icon arsenic-title-icon" aria-hidden>
                As
              </span>
              <div>
                <h1 className="pfas-title">{ARSENIC_COPY.title}</h1>
                <p className="pfas-subtitle">{ARSENIC_COPY.subtitle}</p>
              </div>
            </header>

            <ArsenicPathwayVisual />

            <section className="pfas-card pfas-answer" aria-labelledby="arsenic-compare-heading">
              <div className="pfas-answer-body">
                <h2 id="arsenic-compare-heading" className="pfas-verdict-h">
                  <span className="pfas-verdict-mark" aria-hidden>
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <span className="pfas-verdict-text">{ARSENIC_COPY.verdict}</span>
                </h2>
                <p className="pfas-lede">
                  Highlands Ranch Water’s most recent {year.year} entry-point monitoring reported an
                  average arsenic result of{' '}
                  <strong>
                    {formatPpb(year.averagePpb)} {year.unit}
                  </strong>
                  . The current EPA Maximum Contaminant Level is {formatPpb(mcl)} {year.unit}.
                </p>

                <div className="pfas-latest">
                  <div>
                    <p className="pfas-stat-k">Average</p>
                    <p className="pfas-metric">
                      {formatPpb(year.averagePpb)}
                      <span>{year.unit}</span>
                    </p>
                    <p className="pfas-meta">{year.shortLabel} result</p>
                  </div>
                  <div>
                    <p className="pfas-stat-k">{ARSENIC_REGULATION.currentRuleLabel}</p>
                    <p className="pfas-metric">
                      {formatPpb(mcl)}
                      <span>{year.unit}</span>
                    </p>
                    <p className="pfas-meta">For arsenic ({ARSENIC_REGULATION.currentRuleName})</p>
                    <button
                      type="button"
                      className="pfas-text-link"
                      aria-expanded={mclOpen}
                      aria-controls={mclId}
                      onClick={() => setMclOpen((open) => !open)}
                    >
                      What is an MCL?
                    </button>
                    <p id={mclId} hidden={!mclOpen} className="pfas-copy">
                      {ARSENIC_COPY.mclHelp}
                    </p>
                  </div>
                  <div className="pfas-compare-col">
                    <p className="pfas-stat-k">How it compares</p>
                    <p className="pfas-metric pfas-metric--ok">
                      {cmp.sharePct}%
                      <span>of the current MCL</span>
                    </p>
                    <div
                      className="pfas-scale"
                      role="img"
                      aria-label={`${formatPpb(year.averagePpb)} ${year.unit} is ${cmp.sharePct} percent of the current ${formatPpb(mcl)} ${year.unit} EPA arsenic MCL`}
                    >
                      <div className="pfas-scale__track">
                        <div className="pfas-scale__fill" style={{ width: `${scalePct}%` }} />
                        <span className="pfas-scale__dot" style={{ left: `${scalePct}%` }} />
                        <span className="pfas-scale__mcl" aria-hidden />
                      </div>
                      <div className="pfas-scale__labels">
                        <span>0 {year.unit}</span>
                        <span>
                          MCL {formatPpb(mcl)} {year.unit}
                        </span>
                      </div>
                    </div>
                    <p className="pfas-scale__caption">
                      {cmp.sharePct}% of the current EPA MCL — a comparison, not a safety or risk
                      score.
                    </p>
                  </div>
                </div>

                <div className="pfas-high">
                  <div>
                    <p className="pfas-stat-k">Highest sample</p>
                    <p className="pfas-high__v">
                      {formatPpb(year.rangeHighPpb)} {year.unit}
                    </p>
                  </div>
                  <p className="pfas-copy">
                    Samples in this year ranged from {rangeText(year)}. {year.sampleSize} entry-point
                    samples were reported. {ARSENIC_COPY.samplesExplain}
                  </p>
                </div>

                <div className="pfas-note">
                  <p>
                    Most recent official HRW report year: {year.shortLabel}. No MCL violation.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="pfas-side-col" aria-labelledby="arsenic-context-heading">
            <section className="lead-context arsenic-context" aria-labelledby="arsenic-context-heading">
              <h2 id="arsenic-context-heading" className="lead-context__h">
                <span className="lead-context__icon" aria-hidden>
                  <Mountain className="h-5 w-5" />
                </span>
                {ARSENIC_COPY.sourceHeading}
              </h2>
              {ARSENIC_COPY.sourceBody.map((para) => (
                <p key={para.slice(0, 32)} className="pfas-copy">
                  {para}
                </p>
              ))}
              <div className="lead-inventory">
                <span className="lead-inventory__mark" aria-hidden>
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <p className="lead-inventory__name">{ARSENIC_COPY.sourceName}</p>
                  <p className="pfas-copy">{HRW_ARSENIC_CCR_META.typicalSources}</p>
                </div>
              </div>
              <a className="pfas-video-btn" href={hrwLatest.url} target="_blank" rel="noreferrer">
                HRW 2026 Water Quality Report
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>

            <section className="lead-update arsenic-update" aria-labelledby="arsenic-update-heading">
              <h2 id="arsenic-update-heading" className="lead-update__h">
                <span className="lead-update__icon" aria-hidden>
                  <Calendar className="h-4 w-4" />
                </span>
                {ARSENIC_COPY.ruleUpdateHeading}
              </h2>
              <div className="lead-update__pair">
                <div>
                  <p className="pfas-stat-k">Current MCL</p>
                  <p className="lead-update__v">
                    {formatPpb(ARSENIC_REGULATION.mclPpb)}{' '}
                    <span>{ARSENIC_REGULATION.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="pfas-stat-k">MCLG</p>
                  <p className="lead-update__v">
                    {formatPpb(ARSENIC_REGULATION.mclgPpb)}{' '}
                    <span>{ARSENIC_REGULATION.unit}</span>
                  </p>
                </div>
              </div>
              <p className="pfas-copy">{ARSENIC_COPY.ruleUpdateBody}</p>
              <a className="pfas-text-link" href={epaArsenic.url} target="_blank" rel="noreferrer">
                {epaArsenic.shortLabel}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
          </aside>

          <section className="pfas-explore" aria-labelledby="arsenic-explore-heading">
            <h2 id="arsenic-explore-heading" className="pfas-sec-h">
              What would you like to explore?
            </h2>
            <ul className="pfas-actions-grid">
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <h3>Has arsenic changed over time?</h3>
                  <p>See official 2024 and 2025 report averages, plus labeled extract history.</p>
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
                  <p>See sample counts, ranges, and the official entry-point averages.</p>
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
                  <h3>How does the MCL work?</h3>
                  <p>Learn why arsenic uses a federal Maximum Contaminant Level.</p>
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
                  <h3>What is arsenic?</h3>
                  <p>Learn why this is a geology and source-water story.</p>
                  <button type="button" onClick={() => setDialog('arsenic')}>
                    Learn about arsenic
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
            </ul>
          </section>

          <section className="pfas-questions" aria-labelledby="arsenic-questions-heading">
            <h2 id="arsenic-questions-heading" className="pfas-sec-h">
              Still have questions?
            </h2>
            <div className="pfas-q-links">
              <a className="metal-ext" href={hrwLatest.url} target="_blank" rel="noreferrer">
                Highlands Ranch Water 2026 Water Quality Report
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="metal-ext" href={epaArsenic.url} target="_blank" rel="noreferrer">
                EPA: drinking water arsenic rule
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="pfas-text-link" href={HRW_CONTACT.phoneHref}>
                Contact Highlands Ranch Water
              </a>
            </div>
          </section>

          <section className="pfas-sources" aria-labelledby="arsenic-sources-heading">
            <h2 id="arsenic-sources-heading" className="sr-only">
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
                  <dd>U.S. Environmental Protection Agency Arsenic Rule</dd>
                </div>
                <div>
                  <dt>Measurement period</dt>
                  <dd>Most recent official year: {year.label}</dd>
                </div>
                {extractDate ? (
                  <div>
                    <dt>WaterLens extract generated</dt>
                    <dd>{extractDate}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>MCL</dt>
                  <dd>{ARSENIC_COPY.mclHelp}</dd>
                </div>
                <div>
                  <dt>WaterLens limitation</dt>
                  <dd>{ARSENIC_COPY.limitation}</dd>
                </div>
              </dl>
              <ul className="pfas-source-list">
                {ARSENIC_COPY.footerCitations.map((citation) => {
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

      {dialog === 'arsenic' ? (
        <PfasDialog title="What is arsenic?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{ARSENIC_COPY.subtitle}</p>
          {ARSENIC_COPY.sourceBody.map((para) => (
            <p key={para.slice(0, 24)} className="pfas-copy">
              {para}
            </p>
          ))}
          <ol className="lead-next-list">
            {ARSENIC_COPY.nextSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}.</strong> {step.body}
              </li>
            ))}
          </ol>
          <div className="pfas-q-links">
            <a className="metal-ext" href={hrwLatest.url} target="_blank" rel="noreferrer">
              Highlands Ranch Water 2026 Water Quality Report
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="metal-ext" href={epaArsenic.url} target="_blank" rel="noreferrer">
              EPA: drinking water arsenic rule
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </PfasDialog>
      ) : null}

      {dialog === 'standard' ? (
        <PfasDialog title="How does the MCL work?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{ARSENIC_COPY.mclHelp}</p>
          <p className="pfas-copy">{ARSENIC_COPY.ruleUpdateBody}</p>
          <p className="pfas-copy">{ARSENIC_COPY.samplesExplain}</p>
          <a className="metal-ext" href={epaArsenic.url} target="_blank" rel="noreferrer">
            {epaArsenic.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}

      {dialog === 'trend' ? (
        <PfasDialog title="Has arsenic changed over time?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{ARSENIC_COPY.chartNote}</p>
          <div className="lead-dialog-table-wrap">
            <table className="lead-dialog-table">
              <caption className="sr-only">Official Highlands Ranch Water arsenic averages</caption>
              <thead>
                <tr>
                  <th scope="col">Report year</th>
                  <th scope="col">Average</th>
                  <th scope="col">Range</th>
                  <th scope="col">Samples</th>
                </tr>
              </thead>
              <tbody>
                {HRW_ARSENIC_CCR_YEARS.map((row) => (
                  <tr key={row.id}>
                    <td>{row.shortLabel}</td>
                    <td>
                      {formatPpb(row.averagePpb)} {row.unit}
                    </td>
                    <td>{rangeText(row)}</td>
                    <td>{row.sampleSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pfas-copy">{trend.message}</p>
          {extractYears.length > 0 ? (
            <>
              <p className="pfas-copy">
                CDPHE yearly summaries from the WaterLens extract are shown next as labeled companion
                history. They are not the official averages used in the verdict card.
              </p>
              <div className="lead-dialog-table-wrap">
                <table className="lead-dialog-table">
                  <caption className="sr-only">CDPHE yearly arsenic summaries</caption>
                  <thead>
                    <tr>
                      <th scope="col">Year</th>
                      <th scope="col">Average</th>
                      <th scope="col">Highest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractYears.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>
                          {formatExtractPpb(row.avg_concentration)} {row.unit === 'ug/L' ? 'ppb' : row.unit}
                        </td>
                        <td>
                          {formatExtractPpb(row.max_concentration)} {row.unit === 'ug/L' ? 'ppb' : row.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          <a className="metal-ext" href={hrwLatest.url} target="_blank" rel="noreferrer">
            {hrwLatest.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}

      {dialog === 'monitoring' ? (
        <PfasDialog title="What did monitoring find?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">{cmp.reportLabel}.</p>
          <div className="lead-dialog-table-wrap">
            <table className="lead-dialog-table">
              <caption className="sr-only">Official Highlands Ranch Water arsenic monitoring</caption>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Average</th>
                  <th scope="col">Range</th>
                  <th scope="col">MCL violation</th>
                </tr>
              </thead>
              <tbody>
                {HRW_ARSENIC_CCR_YEARS.map((row) => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td>
                      {formatPpb(row.averagePpb)} {row.unit}
                    </td>
                    <td>{rangeText(row)}</td>
                    <td>{row.mclViolation ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pfas-copy">{ARSENIC_COPY.samplesExplain}</p>
          <a className="metal-ext" href={hrwPrior.url} target="_blank" rel="noreferrer">
            {hrwPrior.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}
    </div>
  )
}
