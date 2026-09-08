import { useId, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  FlaskConical,
  Play,
  Scale,
  Table2,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import { PfasDialog } from './PfasDialog'
import { PfasHealthSlider } from './PfasHealthSlider'
import { PfasPathwayVisual } from './PfasPathwayVisual'
import {
  BRL_HELP,
  formatExtractDate,
  formatPpt,
  HRW_PFAS_LATEST_META,
  PFAS_VIDEO,
  pfoaComparison,
} from '../../lib/pfasShowcase'
import { getSource, HRW_CONTACT } from '../../lib/sourceRegistry'
import type { PwsPayload } from '../../types/water'
import type { TopicId } from '../TopicsHub'

export type PfasExploreMode = 'trend' | 'results'

export function PfasShowcaseResult({
  utilityLabel,
  water,
  onBack,
  onExplore,
}: {
  utilityLabel: string
  water: PwsPayload
  onBack: () => void
  onExplore: (topic: TopicId, mode: PfasExploreMode) => void
}) {
  const [dialog, setDialog] = useState<'pfas' | 'standard' | null>(null)
  const [mclOpen, setMclOpen] = useState(false)
  const [brlOpen, setBrlOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const mclId = useId()
  const brlId = useId()
  const sourcesId = useId()
  const cmp = pfoaComparison()
  const extractDate = formatExtractDate(water.generated_at)
  const hrw = getSource('hrw_2025_water_quality_report')
  const hrwPfas = getSource('hrw_pfas')
  const epaHealth = getSource('epa_pfas_health')
  const epaRule = getSource('epa_pfas_rule')
  const cdphe = getSource('cdphe_hrw_monitoring')

  return (
    <div className="metal-page pfas-page pfas-enter min-h-svh font-sans">
      <a href="#pfas-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="pfas-main" className="pfas-main">
        <div className="pfas-shell">
          <div className="pfas-main-col">
            <button type="button" className="obs-back pfas-back" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to contaminants
            </button>
            <header className="pfas-title-block">
              <span className="pfas-title-icon" aria-hidden>
                <FlaskConical className="h-7 w-7" />
              </span>
              <div>
                <h1 className="pfas-title">PFAS</h1>
                <p className="pfas-subtitle">
                  PFAS are a large family of man-made chemicals that have been used in products
                  because they resist water, grease and heat. Some can persist in the environment
                  for a long time, which is why drinking-water systems monitor for them.
                </p>
              </div>
            </header>

            <PfasPathwayVisual />

            <section className="pfas-card pfas-answer" aria-labelledby="pfas-compare-heading">
              <div className="pfas-answer-body">
                <h2 id="pfas-compare-heading" className="pfas-verdict-h">
                  <span className="pfas-verdict-mark" aria-hidden>
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <span className="pfas-verdict-text">
                    Within the federal
                    <br />
                    drinking-water limit
                  </span>
                </h2>
                <p className="pfas-lede">
                  Highlands Ranch Water’s {cmp.year} monitoring found an average of{' '}
                  <strong>
                    {formatPpt(cmp.averagePpt)} parts per trillion (ppt)
                  </strong>{' '}
                  for PFOA, one type of PFAS. The federal limit is {formatPpt(cmp.mclPpt)} ppt.
                </p>

                <div className="pfas-latest">
                  <div>
                    <p className="pfas-stat-k">{cmp.year} PFOA average</p>
                    <p className="pfas-metric">
                      {formatPpt(cmp.averagePpt)}
                      <span>parts per trillion (ppt)</span>
                    </p>
                    <p className="pfas-meta">
                      PFAS levels are measured in parts per trillion — extremely small
                      concentrations.
                    </p>
                  </div>
                  <div>
                    <p className="pfas-stat-k">Federal drinking-water limit</p>
                    <p className="pfas-metric">
                      {formatPpt(cmp.mclPpt)}
                      <span>ppt</span>
                    </p>
                    <p className="pfas-meta">
                      The U.S. Environmental Protection Agency (EPA) calls this the Maximum
                      Contaminant Level, or MCL.
                    </p>
                    <button
                      type="button"
                      className="pfas-text-link"
                      aria-expanded={mclOpen}
                      aria-controls={mclId}
                      onClick={() => setMclOpen((o) => !o)}
                    >
                      What is an MCL?
                    </button>
                    <p id={mclId} hidden={!mclOpen} className="pfas-copy">
                      MCL stands for Maximum Contaminant Level. It is the highest level of a
                      regulated contaminant allowed under the federal drinking-water standard.
                    </p>
                  </div>
                  <div className="pfas-compare-col">
                    <p className="pfas-stat-k">How it compares</p>
                    <p className="pfas-metric pfas-metric--ok">
                      {cmp.averageSharePct}%
                      <span>of the federal limit</span>
                    </p>
                    <div
                      className="pfas-scale"
                      role="img"
                      aria-label={`PFOA average ${formatPpt(cmp.averagePpt)} parts per trillion is ${cmp.averageSharePct} percent of the ${formatPpt(cmp.mclPpt)} parts per trillion federal drinking-water limit`}
                    >
                      <div className="pfas-scale__track">
                        <div
                          className="pfas-scale__fill"
                          style={{ width: `${cmp.averageSharePct}%` }}
                        />
                        <span
                          className="pfas-scale__dot"
                          style={{ left: `${cmp.averageSharePct}%` }}
                        />
                        <span className="pfas-scale__mcl" aria-hidden />
                      </div>
                      <div className="pfas-scale__labels">
                        <span>0 ppt</span>
                        <span>{formatPpt(cmp.mclPpt)} ppt limit</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pfas-high">
                  <div>
                    <p className="pfas-stat-k">Highest reported PFOA sample</p>
                    <p className="pfas-high__v">
                      {formatPpt(cmp.highestPpt)} <span>ppt</span>
                    </p>
                  </div>
                  <p className="pfas-copy">
                    Highlands Ranch Water collected {cmp.sampleSize} samples. This is the single
                    highest reading — {formatPpt(cmp.highestPpt)} ppt, still under the{' '}
                    {formatPpt(cmp.mclPpt)} ppt limit (about {cmp.highestSharePct}% of that limit).
                    The official average of {formatPpt(cmp.averagePpt)} ppt is the system-wide
                    number, not this one sample.
                  </p>
                </div>

                <div className="pfas-note">
                  <p>
                    <strong>PFOS</strong> — another PFAS compound — was below the laboratory’s
                    reporting level in this {cmp.year} monitoring set.
                  </p>
                  <button
                    type="button"
                    className="pfas-text-link"
                    aria-expanded={brlOpen}
                    aria-controls={brlId}
                    onClick={() => setBrlOpen((o) => !o)}
                  >
                    What does that mean?
                  </button>
                  <p id={brlId} hidden={!brlOpen} className="pfas-copy">
                    Technical term: below reporting level (BRL). {BRL_HELP} It should not be
                    interpreted as zero.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="pfas-side-col" aria-labelledby="pfas-video-heading">
            <div className="pfas-video-block" id="pfas-video">
              <div className="pfas-video">
                <iframe
                  title="Watch: PFAS explained — YouTube video, does not autoplay"
                  src={PFAS_VIDEO.embedUrl}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h2 id="pfas-video-heading" className="pfas-video-h" tabIndex={-1}>
                <Play className="h-4 w-4" aria-hidden />
                {PFAS_VIDEO.label}
              </h2>
              <p className="pfas-copy">A short explanation of PFAS in drinking water.</p>
              <a className="pfas-video-btn" href={PFAS_VIDEO.watchUrl} target="_blank" rel="noreferrer">
                Open on YouTube
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>

            <PfasHealthSlider officialPpt={cmp.averagePpt} mclPpt={cmp.mclPpt} />
          </aside>

          <section className="pfas-explore" aria-labelledby="pfas-explore-heading">
            <h2 id="pfas-explore-heading" className="pfas-sec-h">
              What would you like to explore?
            </h2>
            <ul className="pfas-actions-grid">
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <h3>Has PFAS changed over time?</h3>
                  <p>
                    See Highlands Ranch Water’s official 2024 and 2025 PFOA averages.
                  </p>
                  <button type="button" onClick={() => onExplore('pfas', 'trend')}>
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
                  <h3>Which PFAS were measured?</h3>
                  <p>See Highlands Ranch Water’s 2025 results for each monitored PFAS compound.</p>
                  <button type="button" onClick={() => onExplore('pfas', 'results')}>
                    View all PFAS results
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
              <li>
                <article className="pfas-action">
                  <span className="pfas-h-icon" aria-hidden>
                    <Scale className="h-4 w-4" />
                  </span>
                  <h3>How does the federal standard work?</h3>
                  <p>Learn what the drinking-water limit means and how utilities are evaluated.</p>
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
                  <h3>What are PFAS?</h3>
                  <p>
                    Learn why PFAS are monitored and why individual compounds are reported
                    separately.
                  </p>
                  <button type="button" onClick={() => setDialog('pfas')}>
                    Learn about PFAS
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              </li>
            </ul>
          </section>

          <section className="pfas-questions" aria-labelledby="pfas-questions-heading">
            <h2 id="pfas-questions-heading" className="pfas-sec-h">
              Still have questions?
            </h2>
            <div className="pfas-q-links">
              <a className="metal-ext" href={hrwPfas.url} target="_blank" rel="noreferrer">
                Highlands Ranch Water PFAS information
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="metal-ext" href={epaHealth.url} target="_blank" rel="noreferrer">
                EPA: how PFAS can affect health
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="pfas-text-link" href={HRW_CONTACT.phoneHref}>
                Contact Highlands Ranch Water
              </a>
            </div>
          </section>

          <section className="pfas-sources" aria-labelledby="pfas-sources-heading">
            <h2 id="pfas-sources-heading" className="sr-only">
              Sources
            </h2>
            <button
              type="button"
              className="pfas-acc"
              aria-expanded={sourcesOpen}
              aria-controls={sourcesId}
              onClick={() => setSourcesOpen((o) => !o)}
            >
              Sources & limitations
              <ChevronDown className={`h-5 w-5 ${sourcesOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            <div id={sourcesId} hidden={!sourcesOpen} className="pfas-acc-panel">
              <dl className="pfas-fresh">
                <div>
                  <dt>Data</dt>
                  <dd>
                    Highlands Ranch Water 2024 and 2025 PFAS monitoring; applicable CDPHE yearly
                    summary
                  </dd>
                </div>
                <div>
                  <dt>Federal reference</dt>
                  <dd>U.S. Environmental Protection Agency</dd>
                </div>
                <div>
                  <dt>Measurement period</dt>
                  <dd>
                    HRW official monitoring years 2024–2025 (latest {HRW_PFAS_LATEST_META.year});
                    CDPHE extract latest PFAS year 2025
                  </dd>
                </div>
                {extractDate ? (
                  <div>
                    <dt>WaterLens extract generated</dt>
                    <dd>{extractDate}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>MCL</dt>
                  <dd>
                    Maximum Contaminant Level — the highest level allowed under the federal
                    drinking-water standard.
                  </dd>
                </div>
                <div>
                  <dt>BRL</dt>
                  <dd>{BRL_HELP}</dd>
                </div>
                <div>
                  <dt>Regulatory status</dt>
                  <dd>
                    2024 final PFOA and PFOS MCLs are current. 2026 EPA actions are proposed, not
                    final. UCMR 5 national PFAS monitoring is complete. UCMR 6 is proposed, not
                    final.
                  </dd>
                </div>
                <div>
                  <dt>WaterLens limitation</dt>
                  <dd>
                    These results describe the public water system, not an individual home’s
                    plumbing.
                  </dd>
                </div>
              </dl>
              <ul className="pfas-source-list">
                <li>
                  <a href={getSource('hrw_2026_ccr').url} target="_blank" rel="noreferrer">
                    {getSource('hrw_2026_ccr').label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={getSource('hrw_2025_ccr').url} target="_blank" rel="noreferrer">
                    {getSource('hrw_2025_ccr').label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={hrwPfas.url} target="_blank" rel="noreferrer">
                    {hrwPfas.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={hrw.url} target="_blank" rel="noreferrer">
                    {hrw.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={epaHealth.url} target="_blank" rel="noreferrer">
                    {epaHealth.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={cdphe.url} target="_blank" rel="noreferrer">
                    {cdphe.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={epaRule.url} target="_blank" rel="noreferrer">
                    {epaRule.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={getSource('epa_ucmr5').url} target="_blank" rel="noreferrer">
                    {getSource('epa_ucmr5').label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={getSource('epa_ucmr6').url} target="_blank" rel="noreferrer">
                    {getSource('epa_ucmr6').label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {dialog === 'pfas' ? (
        <PfasDialog title="What are PFAS?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">
            PFAS are a large group of synthetic chemicals used in many products. Some PFAS persist
            for long periods in the environment and can enter drinking-water sources.
          </p>
          <p className="pfas-copy">
            Because different PFAS have different monitoring and regulatory treatment, WaterLens
            shows individual compounds rather than treating every PFAS result as the same
            measurement.
          </p>
          <div className="pfas-q-links">
            <a className="metal-ext" href={hrwPfas.url} target="_blank" rel="noreferrer">
              Highlands Ranch Water PFAS information
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="metal-ext" href={epaHealth.url} target="_blank" rel="noreferrer">
              EPA: how PFAS can affect health
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </PfasDialog>
      ) : null}

      {dialog === 'standard' ? (
        <PfasDialog title="How does the federal standard work?" onClose={() => setDialog(null)}>
          <p className="pfas-copy">
            The federal drinking-water limit is the highest amount of a regulated contaminant
            allowed in public drinking water. The EPA calls this the Maximum Contaminant Level, or
            MCL.
          </p>
          <p className="pfas-copy">
            For PFOA, the current MCL is {formatPpt(cmp.mclPpt)} parts per trillion.
          </p>
          <p className="pfas-copy">
            A single sample and a regulatory compliance determination are not necessarily the same
            thing. Utilities are evaluated using the applicable monitoring method, not one isolated
            home reading.
          </p>
          <a className="metal-ext" href={epaRule.url} target="_blank" rel="noreferrer">
            EPA PFAS drinking-water regulation
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </PfasDialog>
      ) : null}
    </div>
  )
}
