import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Droplet,
  FileText,
  FlaskConical,
  Home,
  TrendingUp,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { TrendPanel } from './TrendPanel'
import { cn } from '../lib/cn'
import type { ConcernDef, ConcernId } from '../lib/concerns'
import {
  buildInsight,
  educationHook,
  educationOnlyBody,
  evidenceMode,
  evidenceNarrative,
  measurementDisplay,
  resolveAnalyte,
  sourceLinks,
  supplementaryMeasurements,
  whyBullets,
} from '../lib/guidedContent'
import type { EducationPayload, PwsPayload } from '../types/water'

type OpenPanel = 'why' | 'evidence' | null

const CONCERN_ICONS: Record<ConcernId, LucideIcon> = {
  taste: Waves,
  pfas: FlaskConical,
  lead: Droplet,
  report: FileText,
  changes: TrendingUp,
}

const toneStyles = {
  calm: {
    bg: 'bg-[var(--calm-bg)]',
    border: 'border-[var(--calm-border)]',
    label: 'text-[var(--calm-ink)]',
  },
  watch: {
    bg: 'bg-[var(--watch-bg)]',
    border: 'border-[var(--watch-border)]',
    label: 'text-[var(--watch-ink)]',
  },
  act: {
    bg: 'bg-[var(--act-bg)]',
    border: 'border-[var(--act-border)]',
    label: 'text-[var(--act-ink)]',
  },
} as const

function DisclosureButton({
  id,
  label,
  open,
  onToggle,
  panelId,
}: {
  id: string
  label: string
  open: boolean
  onToggle: () => void
  panelId: string
}) {
  return (
    <button
      type="button"
      id={id}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
      className={cn(
        'flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-[17px] font-semibold transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]',
        open
          ? 'border-[var(--brand-blue)]/50 bg-[#F0F9FF] text-[var(--ink-primary)]'
          : 'border-[var(--divider)] bg-white text-[var(--ink-primary)] hover:border-[var(--brand-blue)]/40 hover:bg-[#F8FAFC]',
      )}
    >
      <span>{label}</span>
      <ChevronDown
        className={cn(
          'h-5 w-5 shrink-0 text-[var(--ink-secondary)] transition-transform duration-200',
          open && 'rotate-180',
        )}
        aria-hidden
      />
    </button>
  )
}

export function GuidedView({
  concern,
  water,
  education,
  onExplore,
}: {
  concern: ConcernDef
  water: PwsPayload
  education: EducationPayload | null
  onExplore: (clarifyId: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const [clarifyChoice, setClarifyChoice] = useState<string | null>(null)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  const analyte = clarifyChoice ? resolveAnalyte(concern, clarifyChoice, water) : null
  const insight =
    clarifyChoice ? buildInsight(concern, clarifyChoice, water, analyte) : null
  const mode = clarifyChoice ? evidenceMode(concern.id, clarifyChoice) : 'education-only'
  const measurement = measurementDisplay(analyte)
  const extraMeasurements = clarifyChoice
    ? supplementaryMeasurements(concern, clarifyChoice, water)
    : []
  const hook = educationHook(analyte, education)
  const eduBody = clarifyChoice ? educationOnlyBody(concern.id, clarifyChoice) : null
  const links = sourceLinks(concern.id)
  const ConcernIcon = CONCERN_ICONS[concern.id]

  const motionProps = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
      }

  const togglePanel = (panel: OpenPanel) => {
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  const resetClarify = () => {
    setClarifyChoice(null)
    setOpenPanel(null)
  }

  const showChart = mode === 'chart' && analyte != null
  const showMeasurement = mode === 'chart' || mode === 'measurement'

  return (
    <div className="guided-canvas min-h-svh bg-[var(--canvas)] font-sans text-[17px] leading-relaxed text-[var(--ink-primary)]">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-6 sm:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <a
            href="../../../../index.html"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--divider)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-primary)] shadow-sm transition hover:bg-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            aria-label="Home"
          >
            <Home className="h-4 w-4 shrink-0" aria-hidden />
            Home
          </a>
          {clarifyChoice && (
            <button
              type="button"
              onClick={() => onExplore(clarifyChoice)}
              className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--brand-blue)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Explore full water data
            </button>
          )}
        </header>

        <main>
          {!clarifyChoice ? (
            <motion.section {...motionProps} aria-labelledby="clarify-heading">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                {water.pws_label}
              </p>
              <div className="mt-3 flex items-start gap-3">
                <ConcernIcon
                  className="mt-1 h-8 w-8 shrink-0 text-[var(--brand-blue)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div>
                  <h1
                    id="clarify-heading"
                    className="text-2xl font-semibold tracking-tight sm:text-[28px] sm:leading-tight"
                  >
                    {concern.clarifyQuestion}
                  </h1>
                  <p className="mt-2 text-[var(--ink-secondary)]">{concern.clarifyHint}</p>
                </div>
              </div>

              <ul className="mt-8 space-y-3" role="list">
                {concern.clarifyOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => setClarifyChoice(option.id)}
                      className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-[var(--divider)] bg-white px-4 py-3.5 text-left shadow-[var(--shadow-card)] transition hover:border-[var(--brand-blue)]/40 hover:bg-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    >
                      <span className="font-medium">{option.label}</span>
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-[var(--ink-secondary)]"
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </motion.section>
          ) : (
            insight && (
              <motion.section {...motionProps} aria-labelledby="insight-title">
                <article
                  className={cn(
                    'rounded-3xl border p-6 shadow-[var(--shadow-card)] sm:p-8',
                    toneStyles[insight.tone].bg,
                    toneStyles[insight.tone].border,
                  )}
                >
                  <p
                    id="insight-title"
                    className={cn(
                      'text-[11px] font-semibold uppercase tracking-[0.08em]',
                      toneStyles[insight.tone].label,
                    )}
                  >
                    {insight.title}
                  </p>
                  <p className="mt-4 text-xl font-semibold leading-snug tracking-tight sm:text-[20px]">
                    {insight.headline}
                  </p>
                  <p className="mt-4 text-[var(--ink-primary)]">{insight.verdict}</p>
                  <p className="mt-4 font-medium text-[var(--ink-primary)]">
                    <span className="font-semibold">What to do next:</span> {insight.nextStep}
                  </p>
                  <p className="mt-4 text-[13px] leading-relaxed text-[var(--ink-secondary)]">
                    {insight.disclaimer}
                  </p>
                </article>

                <div className="mt-3 space-y-3">
                  <DisclosureButton
                    id="why-toggle"
                    label="Why?"
                    open={openPanel === 'why'}
                    onToggle={() => togglePanel('why')}
                    panelId="why-panel"
                  />
                  <AnimatePresence initial={false}>
                    {openPanel === 'why' && (
                      <motion.div
                        id="why-panel"
                        role="region"
                        aria-labelledby="why-toggle"
                        initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl border border-[var(--divider)] bg-white p-6">
                          <ul className="list-disc space-y-2 pl-5 text-[var(--ink-primary)]">
                            {whyBullets(concern.id, clarifyChoice).map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                          <p className="mt-4 text-[13px] text-[var(--ink-secondary)]">
                            Tap water at your home may differ from system-wide monitoring.
                          </p>
                          <p className="mt-3 text-[13px]">
                            {links.map((link, i) => (
                              <span key={link.url}>
                                {i > 0 && ' · '}
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-[var(--brand-blue)] underline-offset-2 hover:underline"
                                >
                                  {link.label}
                                </a>
                              </span>
                            ))}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <DisclosureButton
                    id="evidence-toggle"
                    label="Show me why"
                    open={openPanel === 'evidence'}
                    onToggle={() => togglePanel('evidence')}
                    panelId="evidence-panel"
                  />
                  <AnimatePresence initial={false}>
                    {openPanel === 'evidence' && (
                      <motion.div
                        id="evidence-panel"
                        role="region"
                        aria-labelledby="evidence-toggle"
                        initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 rounded-2xl border border-[var(--divider)] bg-white p-6">
                          <p className="text-[var(--ink-primary)]">
                            {evidenceNarrative(concern, clarifyChoice, water, analyte)}
                          </p>

                          {eduBody && (
                            <p className="text-sm text-[var(--ink-secondary)]">{eduBody}</p>
                          )}

                          {showMeasurement && measurement && (
                            <div className="rounded-2xl border border-[var(--divider)] bg-[#F8FAFC] p-5">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                                {measurement.analyteName}
                              </p>
                              <p className="mt-2 text-2xl font-semibold tabular-nums">
                                {measurement.value}
                              </p>
                              <p className="mt-1 text-[13px] text-[var(--ink-secondary)]">
                                {measurement.limit != null && (
                                  <>Federal limit: {measurement.limit}</>
                                )}
                                {measurement.ratioLabel != null && (
                                  <> · {measurement.ratioLabel}</>
                                )}
                                {measurement.year != null && (
                                  <> · Latest year: {measurement.year}</>
                                )}
                              </p>
                              {measurement.category && (
                                <p className="mt-2 font-medium">{measurement.category}</p>
                              )}
                            </div>
                          )}

                          {extraMeasurements.map((extra) => (
                            <div
                              key={extra.analyteName}
                              className="rounded-2xl border border-[var(--divider)] bg-[#F8FAFC] p-5"
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                                {extra.analyteName}
                              </p>
                              <p className="mt-2 text-2xl font-semibold tabular-nums">
                                {extra.value}
                              </p>
                              <p className="mt-1 text-[13px] text-[var(--ink-secondary)]">
                                {extra.limit != null && <>Federal limit: {extra.limit}</>}
                                {extra.ratioLabel != null && <> · {extra.ratioLabel}</>}
                                {extra.year != null && <> · Latest year: {extra.year}</>}
                              </p>
                              {extra.category && (
                                <p className="mt-2 font-medium">{extra.category}</p>
                              )}
                            </div>
                          ))}

                          {hook && (
                            <p className="text-sm text-[var(--ink-secondary)]">{hook}</p>
                          )}

                          {showChart && analyte && (
                            <TrendPanel
                              analyte={analyte}
                              headingLevel="h3"
                              chartHeightClass="h-[220px] sm:h-72"
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => onExplore(clarifyChoice)}
                    className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-4 py-3.5 text-[17px] font-semibold text-white shadow-sm transition hover:bg-[var(--brand-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    Explore full water data
                  </button>

                  <button
                    type="button"
                    onClick={resetClarify}
                    className="mx-auto block min-h-[44px] px-4 py-2 text-sm font-medium text-[var(--brand-blue)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    Change my answer
                  </button>
                </div>
              </motion.section>
            )
          )}
        </main>
      </div>
    </div>
  )
}
