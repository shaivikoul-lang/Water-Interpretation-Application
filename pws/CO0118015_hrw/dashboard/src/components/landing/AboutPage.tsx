import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingCommunitySection, LandingProcessSection } from './LandingStorySections'

export function AboutPage({
  utilityLabel,
  onHome,
  onAbout,
}: {
  utilityLabel: string
  onHome: () => void
  onAbout: () => void
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
      />

      <main id="main-content">
        <LandingProcessSection />
        <LandingCommunitySection />
      </main>

      <LandingFooter />
    </div>
  )
}
