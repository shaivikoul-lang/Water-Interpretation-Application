import { ArrowRight } from 'lucide-react'
import { START_CARDS, type LandingIntent } from '../../lib/landingIntents'
import {
  BarGraphCardIcon,
  DropletCardIcon,
  FlaskCardIcon,
  TestTubeCardIcon,
} from './LandingIcons'

const CARD_ICONS = {
  noticing: DropletCardIcon,
  'home-reading': TestTubeCardIcon,
  contaminant: FlaskCardIcon,
  changed: BarGraphCardIcon,
} as const

const CARD_THEMES = {
  noticing: 'landing-card--noticing',
  'home-reading': 'landing-card--reading',
  contaminant: 'landing-card--contaminant',
  changed: 'landing-card--changed',
} as const

export function StartCards({ onIntent }: { onIntent: (intent: LandingIntent) => void }) {
  return (
    <section id="start-cards" className="landing-start" aria-labelledby="start-heading">
      <div className="landing-container">
        <h2 id="start-heading" className="landing-start__title">
          What brought you to WaterLens today?
        </h2>
        <p className="landing-start__lede">
          Start with the option that best describes your situation.
        </p>

        <ul className="landing-start-grid">
          {START_CARDS.map((card) => {
            const Icon = CARD_ICONS[card.id as keyof typeof CARD_ICONS]
            const theme = CARD_THEMES[card.id as keyof typeof CARD_THEMES]
            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => onIntent(card.intent)}
                  className={`landing-card ${theme}`}
                >
                  <span className="landing-card__icon-wrap" aria-hidden>
                    <Icon className="landing-card__icon" />
                  </span>
                  <span className="landing-card__title">{card.title}</span>
                  <span className="landing-card__body">{card.description}</span>
                  <span className="landing-card__arrow" aria-hidden>
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
