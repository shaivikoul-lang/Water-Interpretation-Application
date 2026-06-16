import { motion } from 'framer-motion'
import {
  ArrowRight,
  Droplets,
  FlaskConical,
  Layers,
  Waves,
} from 'lucide-react'
import { cn } from '../lib/cn'

export type TopicId = 'pfas' | 'lead-copper' | 'hard-water' | 'taste-odor'

type Topic = {
  id: TopicId
  title: string
  icon: typeof FlaskConical
  teaser: string
}

const featuredTopics: Topic[] = [
  {
    id: 'hard-water',
    title: 'Hard water',
    icon: Droplets,
    teaser:
      'Highlands Ranch water is moderately hard due to natural minerals like calcium and magnesium. This affects taste and scaling but is not a health risk.',
  },
  {
    id: 'taste-odor',
    title: 'Taste & odor',
    icon: Waves,
    teaser:
      'Seasonal changes in water sources can affect taste and odor. These are aesthetic changes and do not indicate a safety issue.',
  },
]

const measureTopics: Topic[] = [
  {
    id: 'pfas',
    title: 'PFAS',
    icon: FlaskConical,
    teaser: 'Reported PFAS compounds and EPA rule context.',
  },
  {
    id: 'lead-copper',
    title: 'Lead & copper',
    icon: Layers,
    teaser: 'Tap sampling and action levels.',
  },
]

export function TopicsHub({
  activeTopic,
  onSelectTopic,
}: {
  activeTopic: TopicId | null
  onSelectTopic: (id: TopicId) => void
}) {
  return (
    <div className="mb-8 space-y-8">
      <section aria-labelledby="featured-topics-heading">
        <div className="mb-3 text-left">
          <h2
            id="featured-topics-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            Common questions about your water
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            The things residents ask about most—explained in plain language.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {featuredTopics.map(({ id, title, teaser, icon: Icon }, i) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <button
                type="button"
                onClick={() => onSelectTopic(id)}
                className={cn(
                  'group flex h-full w-full flex-col rounded-2xl border p-5 text-left transition sm:p-6',
                  activeTopic === id
                    ? 'border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500/40 dark:border-teal-500 dark:bg-teal-950/40'
                    : 'border-teal-200 bg-teal-50/60 hover:border-teal-400 hover:bg-teal-50 dark:border-teal-800 dark:bg-teal-950/25 dark:hover:border-teal-600 dark:hover:bg-teal-950/40',
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="inline-flex rounded-xl bg-teal-500/15 p-2.5 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="rounded-full bg-teal-600/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800 dark:bg-teal-500/20 dark:text-teal-200">
                    Most asked
                  </span>
                </div>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {teaser}
                </span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-300">
                  Learn more
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="measure-topics-heading">
        <div className="mb-3 text-left">
          <h2
            id="measure-topics-heading"
            className="text-base font-semibold text-slate-900 dark:text-white"
          >
            Jump to detailed topics
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Select a topic for additional context and explanation.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {measureTopics.map(({ id, title, teaser, icon: Icon }, i) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <button
                type="button"
                onClick={() => onSelectTopic(id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition',
                  activeTopic === id
                    ? 'border-sky-500 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/40'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-sky-600 dark:hover:bg-slate-900',
                )}
              >
                <span className="inline-flex shrink-0 rounded-lg bg-sky-500/10 p-2 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900 dark:text-white">
                    {title}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {teaser}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-sky-700 dark:text-sky-400">
                  View chart
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  )
}
