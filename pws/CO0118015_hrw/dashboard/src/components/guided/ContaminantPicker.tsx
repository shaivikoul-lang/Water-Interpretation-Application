import { ArrowRight, ChevronLeft, Droplets, FlaskConical, Info, MoreHorizontal, Mountain, Wrench } from 'lucide-react'
import { LandingHeader } from '../landing/LandingHeader'
import {
  CONTAMINANT_COPY,
  contaminantChoices,
  type ContaminantRoute,
} from '../../lib/contaminantChoices'
import type { PwsPayload } from '../../types/water'

const ICONS = {
  pfas: FlaskConical,
  lead: Droplets,
  arsenic: Mountain,
  copper: Wrench,
  lithium: Droplets,
} as const

export function ContaminantPicker({
  utilityLabel,
  water,
  classicHref,
  onBack,
  onSelect,
}: {
  utilityLabel: string
  pwsId: string
  water: PwsPayload | null
  classicHref: string
  onBack: () => void
  onSelect: (route: ContaminantRoute) => void
}) {
  const choices = water ? contaminantChoices(water) : []

  return (
    <div className="cont-page min-h-svh">
      <a href="#cont-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="cont-main" className="obs-main landing-container">
        <button type="button" className="obs-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to Home
        </button>

        <h1 id="cont-heading" className="landing-start__title">
          {CONTAMINANT_COPY.title}
        </h1>

        {water == null ? (
          <p className="cont-loading" role="status">
            Loading available contaminants…
          </p>
        ) : (
          <ul className="landing-start-grid obs-grid">
            {choices.map((choice) => {
              const Icon = ICONS[choice.id as keyof typeof ICONS]
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    className="landing-card landing-card--cont"
                    onClick={() => onSelect(choice.route)}
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
            <li>
              <a
                className="landing-card landing-card--cont"
                href={classicHref}
              >
                <span className="landing-card__icon-wrap" aria-hidden>
                  <MoreHorizontal className="landing-card__icon" />
                </span>
                <span className="obs-card__copy">
                  <span className="landing-card__title">{CONTAMINANT_COPY.otherTitle}</span>
                  <span className="landing-card__body">{CONTAMINANT_COPY.otherBody}</span>
                </span>
                <span className="landing-card__arrow" aria-hidden>
                  <ArrowRight className="h-5 w-5" />
                </span>
              </a>
            </li>
          </ul>
        )}

        <aside className="obs-info" aria-labelledby="cont-note-heading">
          <span className="obs-info__badge" aria-hidden>
            <Info className="h-4 w-4" />
          </span>
          <div>
            <p id="cont-note-heading" className="obs-info__lead">
              WaterLens explains official monitoring data.
            </p>
            <p className="obs-info__body">{CONTAMINANT_COPY.note}</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
