import { ArrowRight, Check, ChevronLeft, TrendingUp } from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import { hrwPfasById, HRW_PFAS_LATEST } from '../../data/hrwPfas2024'
import {
  cdphePfasHistory,
  compoundResidentResult,
  formatPpt,
  percentOfMcl,
  PFAS_COMPOUND_EXPLAIN,
  PFOA_MCL_PPT,
  withinCurrentFederalLimit,
} from '../../lib/pfasShowcase'
import type { PwsPayload } from '../../types/water'
import type { PfasExploreMode } from './PfasShowcaseResult'

function MoleculeMark({
  carbons,
  found,
  label,
}: {
  carbons: number | null
  found: boolean
  label: string
}) {
  if (carbons == null) {
    return (
      <svg className="pfas-mol" viewBox="0 0 220 80" role="img" aria-label={label}>
        <path
          d="M36 54 C70 18, 110 18, 144 40 C166 54, 178 40, 196 32"
          fill="none"
          stroke="#9B2C5D"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M110 18 L128 8" fill="none" stroke="#9B2C5D" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="36" cy="54" r="6" fill="none" stroke="#0B2A4A" strokeWidth="2" />
        <circle cx="110" cy="22" r="6" fill="none" stroke="#9B2C5D" strokeWidth="2" />
        <circle cx="144" cy="40" r="6" fill="none" stroke="#0B2A4A" strokeWidth="2" />
        <circle cx="196" cy="32" r="6" fill="none" stroke="#9B2C5D" strokeWidth="2" />
      </svg>
    )
  }

  const start = 22
  const step = carbons === 1 ? 0 : 176 / (carbons - 1)
  const nodes = Array.from({ length: carbons }, (_, i) => ({ x: start + i * step, y: 40 }))

  return (
    <svg className="pfas-mol" viewBox="0 0 220 80" role="img" aria-label={label}>
      <path
        d={`M${nodes.map((n) => `${n.x} ${n.y}`).join(' L')}`}
        fill="none"
        stroke={found ? '#9B2C5D' : '#8FB0C6'}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r="6"
          fill={found ? (i === 0 || i === nodes.length - 1 ? '#9B2C5D' : '#0B2A4A') : 'none'}
          stroke={found ? '#0B2A4A' : '#0B2A4A'}
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

function CompoundCard({
  compound,
}: {
  compound: (typeof HRW_PFAS_LATEST)[number]
}) {
  const row = compoundResidentResult(compound)
  const explain = PFAS_COMPOUND_EXPLAIN[compound.id]
  const found = !compound.belowReportingLevel
  const withinLimit = withinCurrentFederalLimit(compound)

  return (
    <li className={found ? 'pfas-compound pfas-compound--found' : 'pfas-compound'}>
      <div className="pfas-compound__art">
        {explain ? (
          <MoleculeMark carbons={explain.carbons} found={found} label={explain.chainLabel} />
        ) : null}
      </div>
      <div className="pfas-compound__body">
        <p className="pfas-compound__chain">{explain?.chainLabel}</p>
        <p className="pfas-result-list__name">{compound.name}</p>
        {explain ? <p className="pfas-compound__full">{explain.fullName}</p> : null}

        {found ? (
          <div className="pfas-compound__stats">
            {compound.averagePpt != null ? (
              <div>
                <p className="pfas-stat-k">Average</p>
                <p className="pfas-compound__val">
                  {formatPpt(compound.averagePpt)} <span>ppt</span>
                </p>
              </div>
            ) : null}
            {compound.rangeHighPpt != null ? (
              <div>
                <p className="pfas-stat-k">Highest sample</p>
                <p className="pfas-compound__val">
                  {formatPpt(compound.rangeHighPpt)} <span>ppt</span>
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="pfas-brl-badge">Below the laboratory’s reporting level</p>
        )}

        {withinLimit && compound.individualMclPpt != null ? (
          <p className="pfas-limit-hint">
            <span className="pfas-limit-hint__mark" aria-hidden>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            Average and highest sample are within the {formatPpt(compound.individualMclPpt)} ppt
            federal limit
          </p>
        ) : found ? (
          <p className="pfas-meta">{row.detail}</p>
        ) : null}
        {explain ? <p className="pfas-copy">{explain.meaning}</p> : null}
      </div>
    </li>
  )
}

export function PfasEvidenceView({
  utilityLabel,
  water,
  mode,
  onBackToPfas,
  onSwitchMode,
}: {
  utilityLabel: string
  water: PwsPayload
  mode: PfasExploreMode
  onBackToPfas: () => void
  onSwitchMode: (mode: PfasExploreMode) => void
}) {
  const pfoa2024 = hrwPfasById('PFOA', 2024)
  const pfoa2025 = hrwPfasById('PFOA', 2025)
  const cdphe = cdphePfasHistory(water, 'PFOA')
  const cdpheAvg = cdphe.find((p) => p.series === 'average')
  const isTrend = mode === 'trend'
  const measured = HRW_PFAS_LATEST.filter((c) => !c.belowReportingLevel)
  const belowLevel = HRW_PFAS_LATEST.filter((c) => c.belowReportingLevel)

  return (
    <div className="metal-page pfas-page pfas-enter min-h-svh font-sans">
      <a href="#explore-data" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="explore-data" className="pfas-main pfas-evidence" tabIndex={-1}>
        <button type="button" className="obs-back pfas-back" onClick={onBackToPfas}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to PFAS
        </button>

        {isTrend ? (
          <section className="pfas-trend" aria-labelledby="pfas-evidence-heading">
            <header className="pfas-results-head">
              <h1 id="pfas-evidence-heading" className="pfas-evidence-q">
                Has PFAS changed over time?
              </h1>
              <p className="pfas-evidence-answer">
                The 2025 official average is higher than 2024
              </p>
              <p className="pfas-lede">
                These two numbers come from Highlands Ranch Water’s own PFAS tables — 2024 in the
                2025 Water Quality Report, and 2025 in the 2026 report. Both are PFOA averages.
                Both are within the 4.0 ppt federal drinking-water limit.
              </p>
            </header>

            {pfoa2024?.averagePpt != null && pfoa2025?.averagePpt != null ? (
              <div className="pfas-compare-board">
                <article className="pfas-test">
                  <p className="pfas-year-pill">2024</p>
                  <p className="pfas-span__value">
                    {formatPpt(pfoa2024.averagePpt)} <span>ppt PFOA average</span>
                  </p>
                  <div className="pfas-year-bar" aria-hidden>
                    <span
                      style={{
                        width: `${(pfoa2024.averagePpt / pfoa2025.averagePpt) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="pfas-copy">Official Highlands Ranch Water PFAS monitoring. 16 samples.</p>
                  {pfoa2024.rangeHighPpt != null ? (
                    <p className="pfas-meta">
                      Highest sample {formatPpt(pfoa2024.rangeHighPpt)} ppt
                    </p>
                  ) : null}
                </article>

                <div className="pfas-compare-arrow" aria-hidden>
                  <span className="pfas-compare-arrow__mark">
                    <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
                  </span>
                  <span>Higher</span>
                </div>

                <article className="pfas-test pfas-test--primary">
                  <p className="pfas-year-pill pfas-year-pill--latest">Latest · 2025</p>
                  <p className="pfas-span__value">
                    {formatPpt(pfoa2025.averagePpt)} <span>ppt PFOA average</span>
                  </p>
                  <div className="pfas-year-bar pfas-year-bar--latest" aria-hidden>
                    <span style={{ width: '100%' }} />
                  </div>
                  <p className="pfas-copy">Official Highlands Ranch Water PFAS monitoring. 12 samples.</p>
                  {pfoa2025.rangeHighPpt != null ? (
                    <p className="pfas-meta">
                      Highest sample {formatPpt(pfoa2025.rangeHighPpt)} ppt
                    </p>
                  ) : null}
                </article>
              </div>
            ) : null}

            {pfoa2024?.averagePpt != null && pfoa2025?.averagePpt != null ? (
              <figure className="pfas-limit-map">
                <figcaption className="pfas-stat-k">
                  Both averages vs the {formatPpt(PFOA_MCL_PPT)} ppt federal limit
                </figcaption>
                <div
                  className="pfas-limit-map__rail"
                  role="img"
                  aria-label={`Official PFOA averages: 2024 ${formatPpt(pfoa2024.averagePpt)} parts per trillion and 2025 ${formatPpt(pfoa2025.averagePpt)} parts per trillion, both below the ${formatPpt(PFOA_MCL_PPT)} parts per trillion federal drinking-water limit.`}
                >
                  <span className="pfas-limit-map__track">
                    <span
                      className="pfas-limit-map__fill"
                      style={{ width: `${percentOfMcl(pfoa2025.averagePpt, PFOA_MCL_PPT) * 100}%` }}
                    />
                  </span>
                  <span
                    className="pfas-limit-map__dot pfas-limit-map__dot--prior"
                    style={{ left: `${percentOfMcl(pfoa2024.averagePpt, PFOA_MCL_PPT) * 100}%` }}
                  >
                    <span className="pfas-limit-map__lab pfas-limit-map__lab--above">2024</span>
                  </span>
                  <span
                    className="pfas-limit-map__dot pfas-limit-map__dot--latest"
                    style={{ left: `${percentOfMcl(pfoa2025.averagePpt, PFOA_MCL_PPT) * 100}%` }}
                  >
                    <span className="pfas-limit-map__lab pfas-limit-map__lab--below">2025</span>
                  </span>
                  <span className="pfas-limit-map__cap" aria-hidden />
                </div>
                <div className="pfas-scale__labels">
                  <span>0 ppt</span>
                  <span>{formatPpt(PFOA_MCL_PPT)} ppt limit</span>
                </div>
              </figure>
            ) : null}

            <p className="pfas-trend-take">
              <span className="pfas-limit-hint__mark" aria-hidden>
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span>
                The latest official average is{' '}
                {pfoa2025?.averagePpt != null ? formatPpt(pfoa2025.averagePpt) : '—'} ppt. That is
                the number on the main PFAS page. It is still well under the 4.0 ppt federal limit.
              </span>
            </p>
            {cdpheAvg ? (
              <p className="pfas-other-note">
                Colorado also publishes a 2025 yearly summary ({formatPpt(cdpheAvg.value)} ppt
                PFOA average). That is a different test. Do not treat it as a third year of this
                Highlands Ranch Water table.
              </p>
            ) : null}
          </section>
        ) : (
          <section className="pfas-results" aria-labelledby="pfas-evidence-heading">
            <header className="pfas-results-head">
              <h1 id="pfas-evidence-heading" className="pfas-evidence-q">
                Which PFAS were measured?
              </h1>
              <p className="pfas-lede">
                Highlands Ranch Water’s 2025 monitoring looked for six PFAS compounds. Each
                abbreviation is a different chemical. The mark at the top of a card shows its
                carbon chain — the reason the names look different.
              </p>
            </header>

            <h2 className="pfas-results-k pfas-results-k--found">
              <span className="pfas-results-k__dot" aria-hidden />
              Reported concentrations
            </h2>
            <ul className="pfas-compound-grid pfas-compound-grid--found">
              {measured.map((compound) => (
                <CompoundCard key={compound.id} compound={compound} />
              ))}
            </ul>

            <h2 className="pfas-results-k pfas-results-k--brl">
              <span className="pfas-results-k__dot" aria-hidden />
              Below the laboratory reporting level
            </h2>
            <figure className="pfas-brl-key">
              <div
                className="pfas-brl-key__rail"
                role="img"
                aria-label="Below reporting level means the laboratory did not report a quantifiable concentration above its reporting threshold. That is not the same as zero, and it does not necessarily mean the substance is absent."
              >
                <div className="pfas-brl-key__side pfas-brl-key__side--found">
                  <svg viewBox="0 0 88 20" className="pfas-brl-key__chain" aria-hidden>
                    <path d="M8 10 H80" fill="none" stroke="#9B2C5D" strokeWidth="2.2" />
                    <circle cx="8" cy="10" r="5" fill="#9B2C5D" />
                    <circle cx="32" cy="10" r="5" fill="#0B2A4A" />
                    <circle cx="56" cy="10" r="5" fill="#0B2A4A" />
                    <circle cx="80" cy="10" r="5" fill="#9B2C5D" />
                  </svg>
                  <p className="pfas-brl-key__label">A number was reported</p>
                </div>
                <div className="pfas-brl-key__mid">
                  <span className="pfas-brl-key__rule" aria-hidden />
                  <p className="pfas-brl-key__threshold">Reporting threshold</p>
                </div>
                <div className="pfas-brl-key__side pfas-brl-key__side--brl">
                  <svg viewBox="0 0 88 20" className="pfas-brl-key__chain" aria-hidden>
                    <path d="M8 10 H80" fill="none" stroke="#8FB0C6" strokeWidth="2.2" />
                    <circle cx="8" cy="10" r="5" fill="none" stroke="#0B2A4A" strokeWidth="2" />
                    <circle cx="32" cy="10" r="5" fill="none" stroke="#0B2A4A" strokeWidth="2" />
                    <circle cx="56" cy="10" r="5" fill="none" stroke="#0B2A4A" strokeWidth="2" />
                    <circle cx="80" cy="10" r="5" fill="none" stroke="#0B2A4A" strokeWidth="2" />
                  </svg>
                  <p className="pfas-brl-key__label">No number reported</p>
                  <p className="pfas-brl-key__notzero">Not the same as zero</p>
                </div>
              </div>
            </figure>
            <ul className="pfas-compound-grid">
              {belowLevel.map((compound) => (
                <CompoundCard key={compound.id} compound={compound} />
              ))}
            </ul>
          </section>
        )}

        <p>
          <button
            type="button"
            className="pfas-text-link"
            onClick={() => onSwitchMode(isTrend ? 'results' : 'trend')}
          >
            {isTrend ? 'View all PFAS results' : 'View available measurements'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </p>

        {isTrend ? null : (
          <p className="pfas-meta">
            These results are from Highlands Ranch Water’s 2025 PFAS monitoring.
          </p>
        )}
      </main>
    </div>
  )
}
