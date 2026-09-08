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
  Leaf,
  Lightbulb,
  Mail,
  Phone,
  Shield,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import {
  EARTHY_COPY,
  earthyChecks,
  earthyDataThroughYear,
  earthyEvidenceItems,
} from '../../lib/earthyMusty'
import { getSource, HRW_CONTACT, type SourceId } from '../../lib/sourceRegistry'
import type { PwsPayload } from '../../types/water'
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

export function EarthyMustyResult({
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
  const [regOpen, setRegOpen] = useState(false)
  const evidenceId = useId()
  const regId = useId()
  const checks = earthyChecks(water)
  const evidence = earthyEvidenceItems(checks)
  const dataThrough = earthyDataThroughYear(checks)

  return (
    <div className="metal-page cloud-page min-h-svh font-sans">
      <a href="#musty-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="musty-main" className="metal-main">
        <button type="button" className="obs-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to observations
        </button>

        <div className="metal-hero">
          <div className="metal-title-block">
            <span className="metal-title-icon" aria-hidden>
              <Leaf className="h-6 w-6" />
            </span>
            <div>
              <h1 className="metal-title">{EARTHY_COPY.title}</h1>
              <p className="metal-subtitle">{EARTHY_COPY.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="metal-grid cloud-grid">
          <aside className="cloud-takeaway metal-takeaway" aria-labelledby="musty-takeaway-heading">
            <span className="obs-info__badge" aria-hidden>
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h2 id="musty-takeaway-heading" className="metal-card-h">
                The short answer
              </h2>
              <p className="metal-body">{EARTHY_COPY.takeaway}</p>
            </div>
          </aside>

          <section className="cloud-meaning metal-card" aria-labelledby="musty-meaning-heading">
            <h2 id="musty-meaning-heading" className="metal-card-h">
              <span className="metal-h-icon" aria-hidden>
                <BookOpen className="h-4 w-4" />
              </span>
              What does this usually mean?
            </h2>
            {EARTHY_COPY.meaning.map((para) => (
              <p key={para.slice(0, 24)} className="metal-body mt-3">
                {para}
              </p>
            ))}
            <div className="metal-ext-row">
              <SourceLink id="hrw_water_quality_faq">Highlands Ranch Water FAQs</SourceLink>
              <SourceLink id="epa_secondary_standards">EPA aesthetic guidance</SourceLink>
            </div>
          </section>

          <section className="cloud-next metal-card" aria-labelledby="musty-next-heading">
            <h2 id="musty-next-heading" className="metal-card-h">
              <span className="metal-h-icon metal-h-icon--green" aria-hidden>
                <Lightbulb className="h-4 w-4" />
              </span>
              What should I do next?
            </h2>
            <ol className="mt-4 space-y-3">
              {EARTHY_COPY.nextSteps.map((step, i) => (
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
          </section>

          <section className="cloud-related metal-card" aria-labelledby="musty-related-heading">
            <h2 id="musty-related-heading" className="metal-card-h">
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
                  onClick={() => onExplore('taste-odor')}
                >
                  Taste and odor
                </button>
              </li>
              <li>
                <button type="button" className="metal-chip" onClick={() => onExplore()}>
                  Explore all water data
                </button>
              </li>
            </ul>
          </section>

          <section className="cloud-evidence metal-span" aria-labelledby="musty-evidence-heading">
            <h2 id="musty-evidence-heading" className="sr-only">
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
                    See the evidence (actual measurements and sources)
                  </span>
                  <span className="mt-0.5 block text-[13px] font-normal text-[#526D82]">
                    View the specific official information behind these results. Full charts
                    remain in Explore Data.
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
              {EARTHY_COPY.dataNote}
            </p>
            <div id={evidenceId} hidden={!evidenceOpen} className="metal-evidence">
              {evidence.length === 0 ? (
                <p className="metal-body">{EARTHY_COPY.evidenceEmpty}</p>
              ) : (
                <p className="metal-body">
                  Measurement rows would appear here only when they exist in this extract.
                </p>
              )}
              <button type="button" className="metal-ext mt-4" onClick={() => onExplore('taste-odor')}>
                Open Explore Data
              </button>
            </div>
          </section>

          <section className="cloud-reg metal-span" aria-labelledby="musty-reg-heading">
            <h2 id="musty-reg-heading" className="sr-only">
              Regulatory context
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
                  <span className="block font-bold text-[#0B2A4A]">Regulatory context</span>
                  <span className="mt-0.5 block text-[13px] font-normal text-[#526D82]">
                    EPA Secondary Standards treat taste and odor as aesthetic guidance, not a
                    health-based MCL.
                  </span>
                </span>
              </span>
              <span className="metal-h-icon" aria-hidden>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${regOpen ? 'rotate-180' : ''}`}
                />
              </span>
            </button>
            <div id={regId} hidden={!regOpen} className="metal-evidence">
              <p className="metal-body">{EARTHY_COPY.regulatory}</p>
              <div className="metal-ext-row">
                <SourceLink id="epa_secondary_standards">EPA aesthetic guidance</SourceLink>
              </div>
            </div>
          </section>

          <section className="cloud-sources metal-span cl-sources" aria-labelledby="musty-sources-heading">
            <h2 id="musty-sources-heading" className="metal-card-h">
              <span className="metal-h-icon" aria-hidden>
                <FileText className="h-4 w-4" />
              </span>
              Sources and limitations
            </h2>
            <p className="metal-body mt-3">{EARTHY_COPY.sourcesIntro}</p>
            <p className="metal-body mt-2 text-[13px]">{EARTHY_COPY.limitation}</p>
            <div className="cl-sources__split">
              <ol className="cl-sources__list">
                {EARTHY_COPY.footerCitations.map((citation, index) => {
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
                <p className="cl-sources__updated">
                  Data through:{' '}
                  {dataThrough != null ? dataThrough : 'not in this extract'}
                </p>
                <p className="cl-sources__note">{EARTHY_COPY.sourcesNote}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
