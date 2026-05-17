import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ExternalLink } from 'lucide-react'
import { cn } from '../lib/cn'
import type { AnalytePack, EduEntry, EducationPayload } from '../types/water'

function defaultEntry(): EduEntry {
  return {
    tier: 'links_only',
    hook:
      'This measure is tracked under Colorado’s public drinking water rules. Use CDPHE and EPA pages for official health information.',
    links: [
      { label: 'CDPHE — Drinking Water Information', url: 'https://cdphe.colorado.gov/dwinfo' },
      {
        label: 'EPA — Drinking water regulations',
        url: 'https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations',
      },
    ],
  }
}

function spikes(analyte: AnalytePack): number[] {
  const out: number[] = []
  for (const r of analyte.by_year) {
    const c = r.category ?? ''
    if (r.over_limit || c === 'Above Limit' || c === 'Approaching Limit')
      out.push(r.year)
  }
  return [...new Set(out)].sort((a, b) => a - b).slice(0, 8)
}

export function EducationAside({
  analyte,
  education,
}: {
  analyte: AnalytePack
  education: EducationPayload | null
}) {
  const entry =
    education?.by_analyte_name?.[analyte.analyte_name] ?? defaultEntry()
  const spikeYears = spikes(analyte)

  return (
    <motion.aside
      layout
      className="sticky top-4 rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-xl ring-1 ring-white/10 dark:bg-slate-950"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
        <BookOpen className="h-4 w-4" />
        What this means
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={analyte.analyte_name}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-3 space-y-4 text-left"
        >
          <p className="text-sm leading-relaxed text-slate-200">{entry.hook}</p>
          {spikeYears.length > 0 && (
            <div className="rounded-xl bg-amber-400/15 px-3 py-2 text-xs text-amber-50 ring-1 ring-amber-400/30">
              <strong className="block text-amber-100">Years closer to or above the limit</strong>
              {spikeYears.join(', ')}
              {spikeYears.length >= 8 ? '…' : ''}
            </div>
          )}
          {entry.expanded && entry.expanded.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                A bit more context
              </p>
              {entry.expanded.map((p, i) => (
                <p
                  key={i}
                  className="rounded-lg bg-white/5 px-3 py-2 text-xs leading-relaxed text-slate-200"
                >
                  {p}
                </p>
              ))}
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Official references
            </p>
            <div className="flex flex-col gap-2">
              {entry.links.map((L) => (
                <a
                  key={L.url}
                  href={L.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15',
                  )}
                >
                  <span className="line-clamp-2">{L.label}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
          {education?.intro && (
            <p className="border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-400">
              {education.intro}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  )
}
