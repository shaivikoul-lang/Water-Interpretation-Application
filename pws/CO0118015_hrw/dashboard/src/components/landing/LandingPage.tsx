import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'
import { StartCards } from './StartCards'
import type { LandingIntent } from '../../lib/landingIntents'
import type { ConcernId } from '../../lib/concerns'
import type { TopicId } from '../TopicsHub'

export function LandingPage({
  utilityLabel,
  onGuided,
  onExplore,
  onContaminant,
  onTdsReading,
  onHome,
  onAbout,
}: {
  utilityLabel: string
  pwsId: string
  onGuided: (concernId: ConcernId) => void
  onExplore: (topic?: TopicId) => void
  onContaminant: () => void
  onTdsReading: () => void
  onHome: () => void
  onAbout: () => void
}) {
  function handleIntent(intent: LandingIntent) {
    if (intent.kind === 'guided') onGuided(intent.concernId)
    else if (intent.kind === 'explore') onExplore(intent.topic)
    else if (intent.kind === 'contaminant') onContaminant()
    else if (intent.kind === 'tds-reading') onTdsReading()
  }

  return (
    <div className="landing min-h-svh bg-white">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>

      <LandingHeader
        utilityLabel={utilityLabel}
        activePage="home"
        onHome={onHome}
        onAbout={onAbout}
        onIntent={handleIntent}
      />

      <main id="main-content">
        <LandingHero />
        <StartCards onIntent={handleIntent} />
      </main>

      <LandingFooter />
    </div>
  )
}
