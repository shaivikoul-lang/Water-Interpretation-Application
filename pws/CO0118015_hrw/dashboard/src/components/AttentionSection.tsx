import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '../lib/cn'
import type { AnalytePack, ExceedRow } from '../types/water'

export function AttentionSection({
  exceedances,
  analytes,
}: {
  exceedances: ExceedRow[]
  analytes: AnalytePack[]
}) {
  const approaching = analytes.filter((a) => {
    const last = a.by_year.find((r) => r.year === a.summary_latest_year)
    return last?.category === 'Approaching Limit' && !last.over_limit
  })

  const hasIssues = exceedances.length > 0 || approaching.length > 0

  if (!hasIssues) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-emerald-500/5 p-5 ring-1 ring-emerald-500/15 dark:bg-emerald-500/10"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="text-left">
            <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
              Nothing flagged as “above limit” in this file
            </h2>
            <p className="mt-1 text-sm text-emerald-800/90 dark:text-emerald-200/90">
              You can still explore each measure below. Official notices and
              testing guidance always belong with CDPHE and your water provider.
            </p>
          </div>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl bg-amber-500/5 p-5 ring-1 ring-amber-400/25 dark:bg-amber-500/10"
    >
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h2 className="text-base font-semibold text-amber-950 dark:text-amber-50">
          What deserves a calm second look
        </h2>
      </div>
      <ul className="space-y-2 text-left text-sm">
        {exceedances.slice(0, 6).map((e) => (
          <li
            key={`${e.analyte_name}-${e.year}`}
            className={cn(
              'rounded-xl border border-amber-200/60 bg-white/80 px-3 py-2 dark:border-amber-500/20 dark:bg-slate-900/60',
            )}
          >
            <span className="font-semibold text-slate-900 dark:text-white">
              {e.analyte_name}
            </span>{' '}
            <span className="text-slate-500">({e.year})</span>
            <span className="mt-0.5 block text-slate-600 dark:text-slate-300">
              {e.summary}
            </span>
          </li>
        ))}
        {approaching.slice(0, 4).map((a) => (
          <li
            key={`app-${a.analyte_name}`}
            className="rounded-xl border border-amber-200/50 bg-white/70 px-3 py-2 text-slate-700 dark:border-amber-500/15 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <span className="font-semibold">{a.analyte_name}</span> is near the
            limit in the latest year in this file—tap the card for the chart.
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
