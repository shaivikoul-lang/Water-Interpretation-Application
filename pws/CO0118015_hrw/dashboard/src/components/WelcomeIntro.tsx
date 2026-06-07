import { motion } from 'framer-motion'
import { BookOpen, HelpCircle, Users } from 'lucide-react'

const items = [
  {
    icon: HelpCircle,
    title: 'What is this?',
    body: 'A community tool that turns Colorado’s public monitoring data for Highlands Ranch Water into plain-language charts and short explanations—not a lab test of water at your tap.',
  },
  {
    icon: Users,
    title: 'Who is it for?',
    body: 'Highlands Ranch residents who want context on reported water quality, trends over time, and links to official guidance from regulators and your utility.',
  },
  {
    icon: BookOpen,
    title: 'How to use it',
    body: 'Start with the snapshot below, browse common topics (PFAS, lead, hardness, taste & odor), then tap any measure for trends and learn-more links.',
  },
] as const

export function WelcomeIntro() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-labelledby="welcome-heading"
      className="mb-6 rounded-3xl bg-gradient-to-br from-[#102a4c] to-[#1a3a5c] p-6 text-white shadow-sm sm:p-8"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-200/90">
            Community water data viewer
          </p>
          <h1
            id="welcome-heading"
            className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Understand Highlands Ranch water-quality data
          </h1>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sky-100 ring-1 ring-white/20">
          Prototype — feedback welcome
        </span>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-100">
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {title}
            </div>
            <p className="text-sm leading-relaxed text-slate-100/90">{body}</p>
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
