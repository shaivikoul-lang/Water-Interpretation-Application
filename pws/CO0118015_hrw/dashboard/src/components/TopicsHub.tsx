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

const topics: {
  id: TopicId
  title: string
  hook: string
  icon: typeof FlaskConical
  hasChart: boolean
}[] = [
  {
    id: 'pfas',
    title: 'PFAS',
    hook: 'See reported PFAS compounds and EPA rule context.',
    icon: FlaskConical,
    hasChart: true,
  },
  {
    id: 'lead-copper',
    title: 'Lead & copper',
    hook: 'Tap sampling and action levels—different from other charts.',
    icon: Layers,
    hasChart: true,
  },
  {
    id: 'hard-water',
    title: 'Hard water',
    hook: 'Minerals and scaling—often a home plumbing question.',
    icon: Droplets,
    hasChart: false,
  },
  {
    id: 'taste-odor',
    title: 'Taste & odor',
    hook: 'Why water can change—sources, seasons, and plumbing.',
    icon: Waves,
    hasChart: false,
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
    <section aria-labelledby="topics-heading" className="mb-8">
      <div className="mb-3 text-left">
        <h2
          id="topics-heading"
          className="text-lg font-semibold text-slate-900 dark:text-white"
        >
          Common topics
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Questions residents ask most often—pick one to jump in.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map(({ id, title, hook, icon: Icon, hasChart }, i) => (
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
                'group flex h-full w-full flex-col rounded-2xl border p-4 text-left transition',
                activeTopic === id
                  ? 'border-sky-500 bg-sky-50 shadow-sm dark:border-sky-500 dark:bg-sky-950/40'
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-sky-600 dark:hover:bg-slate-900',
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="inline-flex rounded-xl bg-sky-500/10 p-2 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {!hasChart && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Guide
                  </span>
                )}
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {title}
              </span>
              <span className="mt-1 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {hook}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky-700 dark:text-sky-400">
                Learn more
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
  )
}
