import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { CommunityIcon } from './LandingIcons'
import { IMPACT_PENDING_MESSAGE } from '../../lib/landingIntents'
import waterfestWebp from '../../assets/waterfest.webp'
import waterfestJpg from '../../assets/waterfest.jpg'

export function CommunityCard() {
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <section
      aria-labelledby="community-heading"
      className="rounded-2xl border border-[#b3ddc7] bg-[#eef9f2] p-5 sm:p-6"
    >
      <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,42%)]">
        <div>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
              <CommunityIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2
                id="community-heading"
                className="text-[19px] font-bold tracking-[-0.01em] text-[#0b3d2a] sm:text-[21px]"
              >
                Built with our community
              </h2>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#1f4b38]">
                WaterLens was shaped by feedback from Highlands Ranch Water and local
                residents at Water Day.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNotice(IMPACT_PENDING_MESSAGE)}
            className="mt-4 inline-flex min-h-[44px] items-center gap-1 rounded-full border border-[#1f7a52] bg-white px-5 text-[14.5px] font-semibold text-[#12603e] transition-colors hover:bg-[#f0fdf4] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#12603e]"
          >
            See our impact
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>

          <div role="status">
            {notice && (
              <p className="mt-3 rounded-xl border border-[#1f7a52] bg-white px-4 py-3 text-[14.5px] font-medium leading-relaxed text-[#0b3d2a]">
                {notice}
              </p>
            )}
          </div>
        </div>

        <figure className="min-w-0">
          <picture>
            <source srcSet={waterfestWebp} type="image/webp" />
            <img
              className="h-36 w-full rounded-xl object-cover sm:h-40"
              src={waterfestJpg}
              width={1200}
              height={600}
              loading="lazy"
              decoding="async"
              alt="Highlands Ranch Water staff talking with residents under the utility's branded canopy at Water Day."
            />
          </picture>
          <figcaption className="mt-2 flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-[#1f4b38]">HR Water Fest</span>
            <span className="landing-script-inline">Cleaner water · Stronger Communities</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
