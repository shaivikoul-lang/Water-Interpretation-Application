import {
  BarChart3,
  ChevronRight,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  UsersRound,
} from 'lucide-react'
import { CommunityIcon } from './LandingIcons'
import { COMMUNITY_IMPACT } from '../../lib/communityImpact'
import wfest1Photo from '../../assets/wfest1.png'

const PROCESS_STEPS = [
  {
    step: 1,
    icon: MessageCircle,
    title: 'Noticed the problem',
    body: 'Residents had questions about their water and needed clearer answers.',
  },
  {
    step: 2,
    icon: Users,
    title: 'Talked with Highlands Ranch Water',
    body: 'We collaborated with local experts to understand the data and priorities.',
  },
  {
    step: 3,
    icon: UsersRound,
    title: 'Listened to residents',
    body: 'Community feedback shaped the features and focus.',
  },
  {
    step: 4,
    icon: Settings,
    title: 'Built and tested WaterLens',
    body: 'A tool designed for real questions, real data, and real people.',
  },
] as const

const VALUE_CARDS = [
  {
    icon: Search,
    iconClass: 'text-[#0B74DE]',
    bgClass: 'bg-[#EAF4FC]',
    title: 'Start with a question',
    body: 'Ask about your water in plain language.',
  },
  {
    icon: BarChart3,
    iconClass: 'text-[#0B5F3A]',
    bgClass: 'bg-[#E8F5EE]',
    title: 'Understand the number',
    body: 'Get clear, contextual explanations.',
  },
  {
    icon: TrendingUp,
    iconClass: 'text-[#7C3AED]',
    bgClass: 'bg-[#F3EEFF]',
    title: 'See what changed',
    body: 'Explore historical data and trends over time.',
  },
  {
    icon: ShieldCheck,
    iconClass: 'text-[#005EA8]',
    bgClass: 'bg-[#EAF4FC]',
    title: 'Source verified',
    body: 'Every answer links to official water data.',
  },
] as const

export function LandingProcessSection() {
  return (
    <section
      aria-labelledby="landing-process-heading"
      className="landing-section landing-section--process"
    >
      <div className="landing-container">
        <p className="landing-section__eyebrow">A community-driven solution</p>
        <h2 id="landing-process-heading" className="landing-section__title">
          Built from real feedback from residents
        </h2>
        <p className="landing-section__lede">
          WaterLens started with a simple idea: residents deserve clear answers about their
          water. Here&apos;s how it came to life.
        </p>

        <ol className="landing-process">
          {PROCESS_STEPS.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={item.title} className="landing-process__item">
                <div className="landing-process__step">
                  <span className="landing-process__badge">{item.step}</span>
                  <span className="landing-process__icon-wrap">
                    <Icon className="h-5 w-5 text-[#005EA8]" aria-hidden />
                  </span>
                  <h3 className="landing-process__title">{item.title}</h3>
                  <p className="landing-process__body">{item.body}</p>
                </div>
                {index < PROCESS_STEPS.length - 1 ? (
                  <span className="landing-process__arrow" aria-hidden>
                    <ChevronRight className="h-5 w-5" />
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export function LandingCommunitySection() {
  return (
    <section
      aria-labelledby="landing-community-banner-heading"
      className="landing-section landing-section--community"
    >
      <div className="landing-container">
        <div className="community-split">
          <div className="community-split__copy">
            <div className="community-split__panel">
              <div className="community-split__head">
                <span className="community-split__icon">
                  <CommunityIcon className="h-7 w-7" />
                </span>
                <h2
                  id="landing-community-banner-heading"
                  className="community-split__title"
                >
                  Built with our community
                </h2>
              </div>

              <p className="community-split__body">
                WaterLens was shaped by feedback from Highlands Ranch Water, neighbors,
                and local residents at Water Day.
              </p>
            </div>

            <div
              className="community-impact"
              aria-labelledby="community-impact-heading"
            >
              <h3 id="community-impact-heading" className="community-impact__title">
                {COMMUNITY_IMPACT.title}
              </h3>
              <ul className="community-impact__stats">
                {COMMUNITY_IMPACT.stats.map((stat) => (
                  <li key={stat.id} className="community-impact__stat">
                    <span className="community-impact__value">{stat.value}</span>
                    <span className="community-impact__label">{stat.label}</span>
                  </li>
                ))}
              </ul>
              <p className="community-impact__note">{COMMUNITY_IMPACT.note}</p>
            </div>
          </div>

          <figure className="community-split__photo">
            <img
              src={wfest1Photo}
              alt="Highlands Ranch Water staff talking with residents under the utility canopy at Water Day."
              width={767}
              height={770}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  )
}

export function LandingValueSection() {
  return (
    <section
      aria-labelledby="landing-value-heading"
      className="landing-section landing-section--value"
    >
      <div className="landing-container">
        <p className="landing-section__eyebrow">Why WaterLens matters</p>
        <h2 id="landing-value-heading" className="landing-section__title">
          Real value for a more informed community
        </h2>
        <p className="landing-section__lede">
          From your first question to trusted answers, WaterLens helps you feel confident
          about your water.
        </p>

        <ul className="landing-value-grid">
          {VALUE_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <li key={card.title} className="landing-value-card">
                <span className={`landing-value-card__icon ${card.bgClass}`}>
                  <Icon className={`h-5 w-5 ${card.iconClass}`} aria-hidden />
                </span>
                <h3 className="landing-value-card__title">{card.title}</h3>
                <p className="landing-value-card__body">{card.body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** @deprecated Use LandingProcessSection, LandingCommunitySection, LandingValueSection */
export function LandingStorySections() {
  return (
    <>
      <LandingProcessSection />
      <LandingCommunitySection />
      <LandingValueSection />
    </>
  )
}
