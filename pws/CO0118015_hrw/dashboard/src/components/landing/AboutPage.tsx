import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingCommunitySection, LandingProcessSection } from './LandingStorySections'
import type { LandingIntent } from '../../lib/landingIntents'

export function AboutPage({
  utilityLabel,
  onHome,
  onAbout,
  onIntent,
}: {
  utilityLabel: string
  onHome: () => void
  onAbout: () => void
  onIntent?: (intent: LandingIntent) => void
}) {
  return (
    <div className="landing min-h-svh bg-white">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>

      <LandingHeader
        utilityLabel={utilityLabel}
        activePage="about"
        onHome={onHome}
        onAbout={onAbout}
        onIntent={onIntent}
      />

      <main id="main-content">
        <LandingProcessSection />
        <LandingCommunitySection />
      </main>

      <LandingFooter />
    </div>
  )
}
