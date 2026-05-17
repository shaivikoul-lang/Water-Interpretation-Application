import { motion } from 'framer-motion'
import { Droplets, ShieldCheck } from 'lucide-react'
import { cn } from '../lib/cn'
import type { OverallTone } from '../lib/derive'

const toneCopy: Record<
  OverallTone,
  { label: string; desc: string; className: string }
> = {
  calm: {
    label: 'Looking steady',
    desc: 'Latest reported year in this file does not show levels above limits for the measures we summarize.',
    className:
      'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30',
  },
  watch: {
    label: 'Worth a closer read',
    desc: 'Some measures are in a “moderate” or “approaching” range in the latest year—see cards below and official links.',
    className:
      'bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:text-amber-100 dark:ring-amber-400/30',
  },
  act: {
    label: 'Attention items',
    desc: 'At least one measure is above the limit used in this dataset for a reported year—review details calmly with official guidance.',
    className:
      'bg-rose-500/10 text-rose-900 ring-rose-500/25 dark:text-rose-100 dark:ring-rose-400/30',
  },
}

function formatUpdated(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function HeroSnapshot({
  utilityLabel,
  pwsId,
  yearSpan,
  generatedAt,
  tone,
}: {
  utilityLabel: string
  pwsId: string
  yearSpan: string
  generatedAt: string
  tone: OverallTone
}) {
  const t = toneCopy[tone]
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-700/80 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3 text-left">
          <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Colorado public monitoring data
          </p>
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Your water snapshot
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">
              {utilityLabel}
            </span>{' '}
            · Public system ID {pwsId}. Chart uses reporting years{' '}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {yearSpan}
            </span>{' '}
            from the state file—interpretation, not a lab test of your tap.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Data refresh shown:{' '}
            <time dateTime={generatedAt}>{formatUpdated(generatedAt)}</time>
          </p>
        </div>
        <div
          className={cn(
            'flex max-w-md flex-col gap-2 rounded-2xl px-4 py-3 text-left ring-1',
            t.className,
          )}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Droplets className="h-4 w-4 shrink-0" aria-hidden />
            {t.label}
          </div>
          <p className="text-sm leading-relaxed opacity-95">{t.desc}</p>
        </div>
      </div>
    </motion.header>
  )
}
