import { useState } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  Cloud,
  Droplet,
  Info,
  Leaf,
  Waves,
  Wine,
} from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import { OBSERVATION_CHOICES, type ObservationIntent } from '../../lib/observationChoices'

const ICONS = {
  metallic: Wine,
  chlorine: Waves,
  cloudy: Cloud,
  musty: Leaf,
  discoloration: Droplet,
  scale: Droplet,
} as const

const VISIBLE_CHOICES = OBSERVATION_CHOICES.filter((choice) => choice.id !== 'other')

function FaucetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M5 4h8v3H8v5h7.5a3.5 3.5 0 0 1 0 7H14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 19v1.5M11.5 19v1.5M16.5 19v1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ObservationPicker({
  utilityLabel,
  onBack,
  onClarify,
}: {
  utilityLabel: string
  pwsId: string
  onBack: () => void
  onClarify: (clarifyId: string) => void
}) {
  const [notice, setNotice] = useState<string | null>(null)

  function handleChoice(intent: ObservationIntent) {
    if (intent.kind === 'pending') {
      setNotice(intent.message)
      return
    }
    setNotice(null)
    onClarify(intent.clarifyId)
  }

  return (
    <div className="obs-page min-h-svh">
      <a href="#obs-main" className="landing-skip-link">
        Skip to main content
      </a>

      <LandingHeader utilityLabel={utilityLabel} />

      <main id="obs-main" className="obs-main landing-container">
        <button type="button" className="obs-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to Home
        </button>

        <h1 id="obs-heading" className="landing-start__title">
          What are you noticing about your water?
        </h1>

        <div role="status">
          {notice && <p className="obs-notice">{notice}</p>}
        </div>

        <ul className="landing-start-grid obs-grid">
          {VISIBLE_CHOICES.map((choice) => {
            const Icon = choice.id === 'scale' ? FaucetIcon : ICONS[choice.id as keyof typeof ICONS]
            return (
              <li key={choice.id}>
                <button
                  type="button"
                  className="landing-card landing-card--obs"
                  onClick={() => handleChoice(choice.intent)}
                >
                  <span className="landing-card__icon-wrap" aria-hidden>
                    <Icon className="landing-card__icon" />
                  </span>
                  <span className="obs-card__copy">
                    <span className="landing-card__title">{choice.title}</span>
                    <span className="landing-card__body">{choice.description}</span>
                  </span>
                  <span className="landing-card__arrow" aria-hidden>
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <aside className="obs-info" aria-labelledby="obs-info-heading">
          <span className="obs-info__badge" aria-hidden>
            <Info className="h-4 w-4" />
          </span>
          <div>
            <p id="obs-info-heading" className="obs-info__lead">
              These observations can have several causes.
            </p>
            <p className="obs-info__body">
              WaterLens connects what you notice to relevant public water-quality
              information; an observation does not prove that a specific contaminant is
              present.
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}
