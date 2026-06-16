import { ExternalLink, X } from 'lucide-react'
import type { TopicId } from './TopicsHub'

const guides: Record<
  Extract<TopicId, 'hard-water' | 'taste-odor'>,
  {
    title: string
    sections: { heading: string; bullets: string[] }[]
    hrLink: { label: string; url: string }
  }
> = {
  'hard-water': {
    title: 'Hard water',
    sections: [
      {
        heading: 'What residents notice',
        bullets: [
          'White scale on fixtures, spots on dishes, or soap that lathers less easily.',
          'Hardness comes from dissolved minerals (especially calcium and magnesium)—it is common in Colorado groundwater.',
        ],
      },
      {
        heading: 'How this shows up in the data',
        bullets: [
          'Hardness is not measured as a single number in this dataset, so there is no chart for it.',
          'The charts in this dashboard show regulated contaminants reported to the state — not mineral hardness levels.',
        ],
      },
      {
        heading: 'What you can do',
        bullets: [
          'A home water softener or point-of-use filter may help with scaling—choices depend on your plumbing and preferences.',
          'For service questions, contact HR Water directly—not this community viewer.',
        ],
      },
    ],
    hrLink: {
      label: 'CDPHE — Drinking Water Information',
      url: 'https://cdphe.colorado.gov/dwinfo',
    },
  },
  'taste-odor': {
    title: 'Taste & odor',
    sections: [
      {
        heading: 'Common causes',
        bullets: [
          'Switching or blending water sources (surface water vs. groundwater) can change taste.',
          'Seasonal algae or organic matter in source water—utilities adjust treatment accordingly.',
          'Chlorine used for disinfection (a normal safety step) can have a noticeable smell, especially after outages or line work.',
          'Household plumbing (including older pipes or a unused tap) can affect what you notice at one faucet.',
        ],
      },
      {
        heading: 'How this shows up in the data',
        bullets: [
          'Taste and odor are not measured as a single number in this dataset.',
          'The charts in this dashboard show regulated contaminants and disinfection byproducts — not whether water tastes or smells fine at your sink.',
        ],
      },
      {
        heading: 'When to reach out',
        bullets: [
          'Persistent changes, color, or pressure problems are best reported to HR Water.',
          'Official HR Water pages may explain recent source or treatment changes—link below when available.',
        ],
      },
    ],
    hrLink: {
      label: 'CDPHE — Drinking Water Information',
      url: 'https://cdphe.colorado.gov/dwinfo',
    },
  },
}

export function TopicGuide({
  topic,
  onClose,
}: {
  topic: Extract<TopicId, 'hard-water' | 'taste-odor'>
  onClose: () => void
}) {
  const guide = guides[topic]

  return (
    <section
      aria-labelledby="topic-guide-heading"
      className="mb-8 rounded-2xl border border-sky-200 bg-sky-50/80 p-5 dark:border-sky-800 dark:bg-sky-950/30 sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
            Topic guide
          </p>
          <h3
            id="topic-guide-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            {guide.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/80 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close topic guide"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {guide.sections.map(({ heading, bullets }) => (
          <div key={heading}>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {heading}
            </h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <a
        href={guide.hrLink.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:underline dark:text-sky-400"
      >
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        {guide.hrLink.label}
      </a>
    </section>
  )
}
