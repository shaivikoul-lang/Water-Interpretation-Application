import { motion } from 'framer-motion'
import { Droplets } from 'lucide-react'
import { cn } from '../lib/cn'
import { snapshotSummaryLine, type MeasureSummary, type OverallTone } from '../lib/derive'

const alertTone: Record<
  OverallTone,
  { title: string; className: string }
> = {
  calm: {
    title: 'Looking steady',
    className:
      'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30',
  },
  watch: {
    title: 'Worth a closer look',
    className:
      'bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:text-amber-100 dark:ring-amber-400/30',
  },
  act: {
    title: 'Attention needed',
    className:
      'bg-rose-500/10 text-rose-900 ring-rose-500/25 dark:text-rose-100 dark:ring-rose-400/30',
  },
}

const statusCopy: Record<
  OverallTone,
  { emoji: string; label: string; className: string }
> = {
  calm: {
    emoji: '🟢',
    label: 'Within safe limits',
    className: 'text-emerald-700 dark:text-emerald-300',
  },
  watch: {
    emoji: '🟡',
    label: 'Approaching limits',
    className: 'text-amber-700 dark:text-amber-300',
  },
  act: {
    emoji: '🔴',
    label: 'Above limits',
    className: 'text-rose-700 dark:text-rose-300',
  },
}

export function HeroSnapshot({
  utilityLabel,
  yearSpan,
  tone,
  safetyTone,
  summary,
  watchCopy,
  onViewAffected,
}: {
  utilityLabel: string
  yearSpan: string
  tone: OverallTone
  safetyTone: OverallTone
  summary: MeasureSummary
  watchCopy?: { title: string; desc: string; action: string; targetName: string | null }
  onViewAffected?: (targetName: string) => void
}) {
  const status = statusCopy[safetyTone]
  const alert = alertTone[tone]
  const showAlert = tone !== 'calm'
  const alertTitle = watchCopy?.title ?? alert.title
  const alertDesc =
    watchCopy?.desc ??
    (tone === 'act'
      ? `${summary.above} measure${summary.above === 1 ? '' : 's'} exceed${summary.above === 1 ? 's' : ''} the limit in recent data.`
      : '')
  const alertAction =
    watchCopy?.action ?? (tone === 'act' ? '👉 View affected measures' : '')

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-700/80 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />

      <div
        className={cn(
          'relative grid gap-6',
          showAlert && 'lg:grid-cols-[minmax(0,1fr)_min(17rem,34%)] lg:items-stretch',
        )}
      >
        <div className="space-y-3 text-left">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Your water snapshot
          </h2>

          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {utilityLabel}
          </p>

          <p className={cn('text-base font-medium', status.className)} role="status">
            {status.emoji} {status.label}
          </p>

          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            <span>
              Safe:{' '}
              <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                {summary.safe}
              </strong>
            </span>
            <span>
              Moderate:{' '}
              <strong className="font-semibold text-amber-700 dark:text-amber-400">
                {summary.moderate}
              </strong>
            </span>
            <span>
              Above limit:{' '}
              <strong className="font-semibold text-rose-700 dark:text-rose-400">
                {summary.above}
              </strong>
            </span>
          </p>

          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            {snapshotSummaryLine(summary)}
          </p>
        </div>

        {showAlert && (
          <div
            className={cn(
              'flex flex-col justify-center gap-2 rounded-2xl px-4 py-3.5 text-left ring-1 lg:min-h-[9rem]',
              alert.className,
            )}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Droplets className="h-4 w-4 shrink-0" aria-hidden />
              {alertTitle}
            </div>
            <p className="text-sm leading-snug opacity-95">{alertDesc}</p>
            {watchCopy?.targetName && onViewAffected ? (
              <button
                type="button"
                onClick={() => onViewAffected(watchCopy.targetName!)}
                className="mt-0.5 text-left text-sm font-semibold opacity-95 underline-offset-2 hover:underline"
              >
                {alertAction}
              </button>
            ) : (
              <p className="text-sm font-semibold opacity-95">{alertAction}</p>
            )}
          </div>
        )}
      </div>

      <div className="relative mt-5 border-t border-slate-200/80 pt-4 text-left text-xs leading-relaxed text-[#6b7280] dark:border-slate-700 dark:text-slate-500">
        <p className="m-0">Data covers reporting years {yearSpan}</p>
        <p className="m-0">Source: Colorado public monitoring files</p>
        <p className="m-0">
          Published monitoring for the whole system — your home tap may differ
        </p>
      </div>
    </motion.header>
  )
}
