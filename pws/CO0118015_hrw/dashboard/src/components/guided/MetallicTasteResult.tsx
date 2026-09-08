import { useId, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Droplets,
  ExternalLink,
  FileText,
  Info,
  Lightbulb,
  Mail,
  Phone,
  Wine,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import {
  dataSourceLabel,
  formatMeasurement,
  metallicChecks,
  metallicDataThroughYear,
  METALLIC_COPY,
  referenceLabel,
} from '../../lib/metallicTaste'
import { getSource, HRW_CONTACT, type SourceId } from '../../lib/sourceRegistry'
import type { PwsPayload } from '../../types/water'
import type { TopicId } from '../TopicsHub'

function SourceLink({ id, children }: { id: SourceId; children?: string }) {
  const source = getSource(id)
  return (
    <a
      className="metal-ext"
      href={source.url}
      target="_blank"
      rel="noreferrer"
    >
      {children ?? source.shortLabel}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

export function MetallicTasteResult({
  utilityLabel,
  water,
  onBack,
  onExplore,
}: {
  utilityLabel: string
  water: PwsPayload
  onBack: () => void
  onExplore: (topic?: TopicId) => void
}) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const evidenceId = useId()
  const checks = metallicChecks(water)
  const available = checks.filter((c) => c.available)
  const dataThrough = metallicDataThroughYear(checks)
  const dataLabel = dataSourceLabel(water)

  return (
    <div className="metal-page min-h-svh">
      <a href="#metal-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="metal-main" className="metal-main">
        <button type="button" className="obs-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to observations
        </button>

        <div className="metal-hero">
          <div className="metal-title-block">
            <span className="metal-title-icon" aria-hidden>
              <Wine className="h-6 w-6" />
            </span>
            <div>
              <h1 className="metal-title">{METALLIC_COPY.title}</h1>
              <p className="metal-subtitle">{METALLIC_COPY.subtitle}</p>
            </div>
          </div>
        </div>

        <aside className="metal-takeaway metal-takeaway--banner" aria-labelledby="metal-takeaway-heading">
          <span className="obs-info__badge" aria-hidden>
            <Info className="h-4 w-4" />
          </span>
          <div>
            <h2 id="metal-takeaway-heading" className="metal-card-h">
              The short answer
            </h2>
            <p className="metal-body">{METALLIC_COPY.takeaway}</p>
          </div>
        </aside>

        <div className="metal-grid">
          <div className="metal-col">
            <section className="metal-card" aria-labelledby="metal-meaning-heading">
              <h2 id="metal-meaning-heading" className="metal-card-h">
                <span className="metal-h-icon" aria-hidden>
                  <BookOpen className="h-4 w-4" />
                </span>
                What does this usually mean?
              </h2>
              {METALLIC_COPY.meaning.map((para) => (
                <p key={para.slice(0, 24)} className="metal-body mt-3">
                  {para}
                </p>
              ))}
              <p className="metal-body mt-2 text-[13px]">
                EPA Secondary Drinking Water Standards are aesthetic, non-mandatory
                guidance — not health-based primary drinking-water limits.
              </p>
              <div className="metal-ext-row">
                <SourceLink id="hrw_water_quality_faq">Highlands Ranch Water FAQs</SourceLink>
                <SourceLink id="epa_secondary_standards">EPA aesthetic guidance</SourceLink>
              </div>
            </section>
          </div>

          <div className="metal-col">

            <section className="metal-card" aria-labelledby="metal-next-heading">
              <h2 id="metal-next-heading" className="metal-card-h">
                <span className="metal-h-icon metal-h-icon--green" aria-hidden>
                  <Lightbulb className="h-4 w-4" />
                </span>
                What should I do next?
              </h2>
              <ol className="mt-4 space-y-3">
                {METALLIC_COPY.nextSteps.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="metal-step" aria-hidden>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[#0B2A4A]">{step.title}</p>
                      <p className="metal-body mt-0.5 text-[14px]">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="metal-contact">
                <h3 className="metal-card-h">
                  <span className="metal-h-icon" aria-hidden>
                    <Phone className="h-4 w-4" />
                  </span>
                  Contact Highlands Ranch Water
                </h3>
                <div className="metal-contact-row">
                  <a className="metal-call" href={HRW_CONTACT.phoneHref}>
                    <Phone className="h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      <span className="block">Call Water Quality Lab</span>
                      <span className="block text-[13px] font-medium">
                        {HRW_CONTACT.phoneDisplay}
                      </span>
                    </span>
                  </a>
                  <a className="metal-email" href={`mailto:${HRW_CONTACT.email}`}>
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      <span className="block">Email</span>
                      <span className="block text-[13px] font-medium text-[#526D82]">
                        {HRW_CONTACT.email}
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </section>

            <section className="metal-card" aria-labelledby="metal-related-heading">
              <h2 id="metal-related-heading" className="metal-card-h">
                <span className="metal-h-icon metal-h-icon--green" aria-hidden>
                  <Droplets className="h-4 w-4" />
                </span>
                Related topics
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                <li>
                  <button
                    type="button"
                    className="metal-chip"
                    onClick={() => onExplore('lead-copper')}
                  >
                    Lead and copper
                  </button>
                </li>
                <li>
                  <button type="button" className="metal-chip" onClick={() => onExplore()}>
                    Explore all water data
                  </button>
                </li>
              </ul>
            </section>
          </div>

          <section className="metal-span" aria-labelledby="metal-evidence-heading">
            <h2 id="metal-evidence-heading" className="sr-only">
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
                    See the evidence (actual measurements and trends)
                  </span>
                  <span className="mt-0.5 block text-[13px] font-normal text-[#526D82]">
                    View the specific data behind these results, including past years and
                    source information. Full charts remain in Explore Data.
                  </span>
                </span>
              </span>
              <span className="metal-h-icon" aria-hidden>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${evidenceOpen ? 'rotate-180' : ''}`}
                />
              </span>
            </button>
            <p className="metal-note">
              <span className="obs-info__badge" aria-hidden>
                <Info className="h-4 w-4" />
              </span>
              {METALLIC_COPY.dataNote}
            </p>
            <div id={evidenceId} hidden={!evidenceOpen} className="metal-evidence">
              {available.length === 0 ? (
                <p className="metal-body">No metallic-related measurements are in this extract.</p>
              ) : (
                <ul className="space-y-3">
                  {available.map((item) => {
                    const row = item.latestRow!
                    return (
                      <li key={item.name} className="rounded-xl border border-[#d5e3f0] bg-white p-4">
                        <p className="font-bold text-[#0B2A4A]">{item.name}</p>
                        <dl className="mt-2 grid gap-1 text-[14px] text-[#334E68] sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-[#526D82]">Measurement</dt>
                            <dd>{formatMeasurement(row)} (year maximum in this extract)</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-[#526D82]">Year</dt>
                            <dd>{row.year}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-[#526D82]">Reference type</dt>
                            <dd>{referenceLabel(row)}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-[#526D82]">Source</dt>
                            <dd>{dataLabel}</dd>
                          </div>
                        </dl>
                      </li>
                    )
                  })}
                </ul>
              )}
              <button type="button" className="metal-ext mt-4" onClick={() => onExplore('lead-copper')}>
                Open Explore Data for charts
              </button>
            </div>
          </section>

          <footer className="metal-span metal-footer" aria-labelledby="metal-sources-heading">
            <div className="metal-footer-sources">
              <h2 id="metal-sources-heading" className="metal-footer-h">
                <FileText className="h-4 w-4 metal-footer-h__icon" aria-hidden />
                Sources
              </h2>
              <ol className="metal-footer-list">
                {METALLIC_COPY.footerCitations.map((citation, index) => {
                  const source = getSource(citation.id)
                  return (
                    <li key={citation.id}>
                      <a
                        className="metal-footer-link"
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="metal-footer-num" aria-hidden>
                          {index + 1}.
                        </span>
                        <span className="metal-footer-link__label">
                          {citation.text}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ol>
            </div>
            <div className="metal-footer-meta">
              <p className="metal-footer-updated">
                Data through:{' '}
                {dataThrough != null ? dataThrough : 'not in this extract'}
              </p>
              <p className="metal-footer-limit">{METALLIC_COPY.limitation}</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
