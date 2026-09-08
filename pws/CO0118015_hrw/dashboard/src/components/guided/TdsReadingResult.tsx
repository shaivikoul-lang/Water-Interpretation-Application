import { useId, useRef, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Droplets,
  ExternalLink,
  FileText,
  Gauge,
  Info,
  Lightbulb,
  Mail,
  Minus,
  Phone,
  Shield,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import { HRW_TDS_2025, hrwTdsStats } from '../../lib/hrwTds2025'
import {
  interpretTdsReading,
  TDS_COPY,
  type TdsInterpretation,
  type TdsWaterType,
} from '../../lib/tdsReading'
import { getSource, HRW_CONTACT, type SourceId } from '../../lib/sourceRegistry'
import type { TopicId } from '../TopicsHub'

function sourcePath(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.host}${parsed.pathname}`.replace(/\/$/, '')
  } catch {
    return url
  }
}

function SourceLink({ id, children }: { id: SourceId; children?: string }) {
  const source = getSource(id)
  return (
    <a className="metal-ext" href={source.url} target="_blank" rel="noreferrer">
      {children ?? source.shortLabel}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

const CITATIONS: { id: SourceId; text: string }[] = [
  { id: 'hrw_water_quality_indicators', text: 'Highlands Ranch Water — Water Quality Indicators' },
  { id: 'epa_secondary_standards', text: 'EPA — Secondary Drinking Water Standards' },
]

function TdsChart() {
  const stats = hrwTdsStats()
  const max = stats.max
  return (
    <figure className="tds-chart">
      <figcaption className="tds-chart__caption">
        Highlands Ranch Water 2025 quarterly TDS averages (finished water)
      </figcaption>
      <ul className="tds-chart__list">
        {HRW_TDS_2025.samples.map((sample) => (
          <li key={sample.quarter} className="tds-chart__row">
            <span className="tds-chart__q">Q{sample.quarter}</span>
            <span className="tds-chart__track" aria-hidden>
              <span
                className="tds-chart__bar"
                style={{ width: `${Math.max(8, (sample.value / max) * 100)}%` }}
              />
            </span>
            <span className="tds-chart__val">
              {sample.value} {HRW_TDS_2025.unit}
            </span>
          </li>
        ))}
      </ul>
      <p className="tds-chart__text">
        Text equivalent: Q1 {HRW_TDS_2025.samples[0].value} mg/L; Q2{' '}
        {HRW_TDS_2025.samples[1].value} mg/L; Q3 {HRW_TDS_2025.samples[2].value} mg/L; Q4{' '}
        {HRW_TDS_2025.samples[3].value} mg/L. Range {stats.min}–{stats.max} mg/L. Latest available
        quarterly average is Q{stats.latest.quarter} at {stats.latest.value} mg/L. Median{' '}
        {stats.median} mg/L. Average {stats.mean} mg/L.
      </p>
    </figure>
  )
}

function ResultStats({
  result,
  compareHrw,
}: {
  result: TdsInterpretation
  compareHrw: boolean
}) {
  return (
    <dl className="tds-stats">
      <div className="tds-stat">
        <dt>Your reading</dt>
        <dd>
          {result.displayReading} {result.unit}
        </dd>
      </div>
      {compareHrw && (
        <div className="tds-stat">
          <dt>
            {result.waterType === 'ro'
              ? 'HRW 2025 tap-water quarterly range'
              : 'HRW 2025 quarterly range'}
          </dt>
          <dd>
            {result.hrwMin}–{result.hrwMax} mg/L
          </dd>
          {result.waterType === 'ro' && (
            <p className="tds-stat__note">Filtered water compared with system water — not a like-for-like match.</p>
          )}
        </div>
      )}
      <div className="tds-stat">
        <dt>EPA Secondary / Aesthetic Guideline</dt>
        <dd>{result.epaSmcl} mg/L</dd>
      </div>
    </dl>
  )
}

export function TdsReadingResult({
  utilityLabel,
  onBack,
  onExplore,
}: {
  utilityLabel: string
  pwsId: string
  onBack: () => void
  onExplore: (topic?: TopicId) => void
}) {
  const [raw, setRaw] = useState('')
  const [waterType, setWaterType] = useState<TdsWaterType>('tap')
  const [result, setResult] = useState<TdsInterpretation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHrwCompare, setShowHrwCompare] = useState(false)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [regOpen, setRegOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)

  const readingId = useId()
  const helperId = useId()
  const errorId = useId()
  const waterTypeName = useId()
  const evidenceId = useId()
  const regId = useId()
  const sourcesId = useId()
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const nextSteps = result?.waterType === 'ro' ? TDS_COPY.nextRo : TDS_COPY.nextTap
  const compareHrw = !!result && (result.waterType === 'tap' || showHrwCompare)
  const hrwSource = getSource('hrw_water_quality_indicators')
  const epaSource = getSource('epa_secondary_standards')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const interpreted = interpretTdsReading(raw, waterType)
    if (!interpreted.valid) {
      setResult(null)
      setError(interpreted.error)
      setShowHrwCompare(false)
      inputRef.current?.focus()
      return
    }
    setError(null)
    setResult(interpreted)
    setShowHrwCompare(false)
    window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
  }

  return (
    <div className="metal-page cloud-page tds-page min-h-svh font-sans">
      <a href="#tds-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="tds-main" className="metal-main">
        <button type="button" className="obs-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to home
        </button>

        <div className="metal-hero">
          <div className="metal-title-block">
            <span className="metal-title-icon" aria-hidden>
              <Gauge className="h-6 w-6" />
            </span>
            <div>
              <h1 className="metal-title">{TDS_COPY.title}</h1>
              <p className="metal-subtitle">{TDS_COPY.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="metal-grid tds-grid">
          <section className="tds-input metal-card" aria-labelledby="tds-input-heading">
            <h2 id="tds-input-heading" className="metal-card-h">
              <span className="metal-h-icon" aria-hidden>
                <BookOpen className="h-4 w-4" />
              </span>
              Enter your reading
            </h2>
            <p className="metal-body mt-3">{TDS_COPY.inputLead}</p>

            <form className="tds-form" onSubmit={handleSubmit} noValidate>
              <div className="tds-field">
                <p className="tds-label" id="tds-measure-label">
                  Measurement
                </p>
                <p className="tds-readonly" aria-labelledby="tds-measure-label">
                  Total Dissolved Solids (TDS)
                </p>
              </div>

              <fieldset className="tds-field">
                <legend className="tds-label">Where did you take this reading?</legend>
                <div className="tds-choices">
                  <label className={`tds-choice${waterType === 'tap' ? ' tds-choice--on' : ''}`}>
                    <input
                      type="radio"
                      name={waterTypeName}
                      value="tap"
                      checked={waterType === 'tap'}
                      onChange={() => setWaterType('tap')}
                    />
                    Tap water
                  </label>
                  <label className={`tds-choice${waterType === 'ro' ? ' tds-choice--on' : ''}`}>
                    <input
                      type="radio"
                      name={waterTypeName}
                      value="ro"
                      checked={waterType === 'ro'}
                      onChange={() => setWaterType('ro')}
                    />
                    RO-filtered water
                  </label>
                </div>
              </fieldset>

              <div className="tds-field">
                <label className="tds-label" htmlFor={readingId}>
                  Enter your TDS reading
                </label>
                <div className="tds-input-row">
                  <input
                    ref={inputRef}
                    id={readingId}
                    name="tds-reading"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={raw}
                    onChange={(event) => setRaw(event.target.value)}
                    aria-describedby={error ? `${helperId} ${errorId}` : helperId}
                    aria-invalid={error ? true : undefined}
                    aria-required="true"
                  />
                  <span className="tds-unit" aria-hidden>
                    ppm
                  </span>
                </div>
                <p id={helperId} className="tds-help">
                  Example: 340
                </p>
                {error && (
                  <p id={errorId} className="tds-error" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <button type="submit" className="tds-submit">
                Understand my reading
              </button>
              {!result && (
                <p className="tds-hint">
                  Your explanation appears below after you enter a reading.
                </p>
              )}
            </form>
          </section>

          {result && (
            <section className="tds-result metal-takeaway" aria-labelledby="tds-result-heading" aria-live="polite">
              <span className="obs-info__badge" aria-hidden>
                <Info className="h-4 w-4" />
              </span>
              <div>
                <h2
                  id="tds-result-heading"
                  className="metal-card-h"
                  ref={resultHeadingRef}
                  tabIndex={-1}
                >
                  What does my reading mean?
                </h2>
                <p className="mt-2 font-bold text-[#0B2A4A]">{result.headline}</p>
                <ResultStats result={result} compareHrw={compareHrw} />
                {result.roNarrative && <p className="metal-body mt-3">{result.roNarrative}</p>}
                {compareHrw && <p className="metal-body mt-3">{result.hrwNarrative}</p>}
                <p className="metal-body mt-3">{result.epaNarrative}</p>
                {result.waterType === 'ro' && !showHrwCompare && (
                  <button
                    type="button"
                    className="metal-ext mt-4"
                    onClick={() => setShowHrwCompare(true)}
                  >
                    Compare with HRW tap-water context
                  </button>
                )}
                <p className="metal-note">
                  WaterLens uses official guidance and published measurements. It does not
                  estimate unmeasured contaminants.
                </p>
              </div>
            </section>
          )}

          <aside className="tds-about metal-takeaway" aria-labelledby="tds-about-heading">
            <span className="obs-info__badge" aria-hidden>
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h2 id="tds-about-heading" className="metal-card-h">
                About home readings
              </h2>
              <p className="metal-body">{TDS_COPY.about}</p>
            </div>
          </aside>

          <section className="tds-tells metal-card" aria-labelledby="tds-tells-heading">
            <h2 id="tds-tells-heading" className="metal-card-h">
              <span className="metal-h-icon" aria-hidden>
                <Droplets className="h-4 w-4" />
              </span>
              What does TDS tell me?
            </h2>
            <p className="metal-body mt-3">{TDS_COPY.tells}</p>
          </section>

          <section className="tds-notell tds-cannot" aria-labelledby="tds-notell-heading">
            <h2 id="tds-notell-heading" className="metal-card-h">
              <span className="metal-h-icon" aria-hidden>
                <Minus className="h-4 w-4" />
              </span>
              What TDS does not tell me
            </h2>
            <p className="metal-body mt-3 font-semibold text-[#0B2A4A]">{TDS_COPY.cannotLead}</p>
            <p className="metal-body mt-2">TDS cannot tell you whether your water contains:</p>
            <ul className="tds-cannot-list">
              {TDS_COPY.cannotItems.map((item) => (
                <li key={item}>
                  <span className="tds-cannot-x" aria-hidden>
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="metal-body mt-3 font-semibold text-[#0B2A4A]">{TDS_COPY.cannotClose}</p>
          </section>

          <section className="tds-next metal-card" aria-labelledby="tds-next-heading">
            <h2 id="tds-next-heading" className="metal-card-h">
              <span className="metal-h-icon metal-h-icon--green" aria-hidden>
                <Lightbulb className="h-4 w-4" />
              </span>
              What should I do next?
            </h2>
            <ol className="mt-4 space-y-3">
              {nextSteps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="metal-step" aria-hidden>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#0B2A4A]">{step.title}</p>
                    <p className="metal-body mt-0.5 text-[14px]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            {result?.escalate && (
              <>
                <p className="metal-body mt-4 font-semibold text-[#0B2A4A]">{TDS_COPY.escalate}</p>
                <div className="cloud-contact">
                  <a
                    className="metal-call"
                    href={HRW_CONTACT.phoneHref}
                    aria-label={`Call Water Quality Lab at ${HRW_CONTACT.phoneDisplay}`}
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      <span className="block">Call Water Quality Lab</span>
                      <span className="block text-[13px] font-medium">{HRW_CONTACT.phoneDisplay}</span>
                    </span>
                  </a>
                  <a
                    className="metal-email"
                    href={`mailto:${HRW_CONTACT.email}`}
                    aria-label={`Email Highlands Ranch Water at ${HRW_CONTACT.email}`}
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      <span className="block">Email</span>
                      <span className="block text-[13px] font-medium text-[#526D82]">
                        {HRW_CONTACT.email}
                      </span>
                    </span>
                  </a>
                </div>
              </>
            )}
          </section>

          <section className="tds-evidence metal-span" aria-labelledby="tds-evidence-heading">
            <h2 id="tds-evidence-heading" className="sr-only">
              Evidence
            </h2>
            <button
              type="button"
              className="metal-disclosure"
              aria-expanded={evidenceOpen}
              aria-controls={evidenceId}
              onClick={() => setEvidenceOpen((open) => !open)}
            >
              <span className="metal-disclosure__copy">
                <span className="metal-h-icon" aria-hidden>
                  <BarChart3 className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-bold text-[#0B2A4A]">
                    See the evidence (HRW measurements and EPA guidance)
                  </span>
                  <span className="mt-0.5 block text-[13px] font-normal text-[#526D82]">
                    View official 2025 quarterly TDS averages and source-data context.
                  </span>
                </span>
              </span>
              <span className="metal-h-icon" aria-hidden>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${evidenceOpen ? 'rotate-180' : ''}`}
                />
              </span>
            </button>
            <div id={evidenceId} hidden={!evidenceOpen} className="metal-evidence">
              <p className="metal-body">{TDS_COPY.evidenceIntro}</p>
              <dl className="tds-meta">
                <div>
                  <dt>Source</dt>
                  <dd>{hrwSource.label}</dd>
                </div>
                <div>
                  <dt>Parameter</dt>
                  <dd>{HRW_TDS_2025.parameter}</dd>
                </div>
                <div>
                  <dt>Unit</dt>
                  <dd>{HRW_TDS_2025.unit}</dd>
                </div>
                <div>
                  <dt>Period</dt>
                  <dd>{HRW_TDS_2025.year} quarterly averages</dd>
                </div>
                <div>
                  <dt>Source-data context</dt>
                  <dd>{HRW_TDS_2025.context}</dd>
                </div>
              </dl>
              <TdsChart />
              <div className="metal-ext-row">
                <SourceLink id="hrw_water_quality_indicators">HRW Water Quality Indicators</SourceLink>
                <button type="button" className="metal-ext" onClick={() => onExplore()}>
                  Open Explore Data
                </button>
              </div>
            </div>
          </section>

          <section className="tds-reg metal-span" aria-labelledby="tds-reg-heading">
            <h2 id="tds-reg-heading" className="sr-only">
              EPA context
            </h2>
            <button
              type="button"
              className="metal-disclosure"
              aria-expanded={regOpen}
              aria-controls={regId}
              onClick={() => setRegOpen((open) => !open)}
            >
              <span className="metal-disclosure__copy">
                <span className="metal-h-icon" aria-hidden>
                  <Shield className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-bold text-[#0B2A4A]">
                    EPA Secondary / Aesthetic Guideline
                  </span>
                  <span className="mt-0.5 block text-[13px] font-normal text-[#526D82]">
                    TDS {result?.epaSmcl ?? 500} mg/L is an EPA Secondary Maximum Contaminant
                    Level (SMCL), not a health-based MCL.
                  </span>
                </span>
              </span>
              <span className="metal-h-icon" aria-hidden>
                <ChevronDown className={`h-5 w-5 transition-transform ${regOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
            <div id={regId} hidden={!regOpen} className="metal-evidence">
              <p className="metal-body">{TDS_COPY.epaContext}</p>
              <p className="metal-body mt-3">
                Source: {epaSource.label}.
              </p>
              <div className="metal-ext-row">
                <SourceLink id="epa_secondary_standards">EPA secondary standards</SourceLink>
              </div>
            </div>
          </section>

          <section className="tds-sources metal-span" aria-labelledby="tds-sources-heading">
            <h2 id="tds-sources-heading" className="sr-only">
              Sources and limitations
            </h2>
            <button
              type="button"
              className="metal-disclosure"
              aria-expanded={sourcesOpen}
              aria-controls={sourcesId}
              onClick={() => setSourcesOpen((open) => !open)}
            >
              <span className="metal-disclosure__copy">
                <span className="metal-h-icon" aria-hidden>
                  <FileText className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-bold text-[#0B2A4A]">Sources and limitations</span>
                  <span className="mt-0.5 block text-[13px] font-normal text-[#526D82]">
                    Information on this page is from Highlands Ranch Water, the U.S. EPA, and your
                    entered reading.
                  </span>
                </span>
              </span>
              <span className="metal-h-icon" aria-hidden>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${sourcesOpen ? 'rotate-180' : ''}`}
                />
              </span>
            </button>
            <div id={sourcesId} hidden={!sourcesOpen} className="metal-evidence cl-sources">
              <p className="metal-body">{TDS_COPY.sourcesIntro}</p>
              <p className="metal-body mt-2 text-[13px]">{TDS_COPY.limitation}</p>
              <div className="cl-sources__split">
                <ol className="cl-sources__list">
                  {CITATIONS.map((citation, index) => {
                    const source = getSource(citation.id)
                    return (
                      <li key={citation.id}>
                        <a
                          className="cl-sources__link"
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="cl-sources__num" aria-hidden>
                            {index + 1}.
                          </span>
                          <span>
                            <span className="cl-sources__title">{citation.text}: </span>
                            <span className="cl-sources__url">{sourcePath(source.url)}</span>
                            <span className="sr-only"> (opens in a new tab)</span>
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ol>
                <div className="cl-sources__meta">
                  <p className="cl-sources__updated">Official HRW TDS period: {HRW_TDS_2025.year}</p>
                  <p className="cl-sources__note">{TDS_COPY.sourcesNote}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
