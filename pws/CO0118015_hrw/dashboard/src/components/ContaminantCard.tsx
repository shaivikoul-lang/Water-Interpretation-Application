import { motion } from 'framer-motion'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../lib/cn'
import {
  categoryTone,
  latestRowForAnalyte,
  ratioPercent,
  trendDirection,
} from '../lib/derive'
import type { AnalytePack } from '../types/water'

const toneRing: Record<string, string> = {
  good: 'ring-emerald-500/30 hover:ring-emerald-400/50',
  caution: 'ring-amber-400/40 hover:ring-amber-300/60',
  warning: 'ring-orange-400/45 hover:ring-orange-300/60',
  critical: 'ring-rose-500/40 hover:ring-rose-400/60',
}

const barColor: Record<string, string> = {
  good: 'bg-emerald-500',
  caution: 'bg-amber-400',
  warning: 'bg-orange-500',
  critical: 'bg-rose-500',
}

export function ContaminantCard({
  analyte,
  selected,
  onSelect,
  index,
}: {
  analyte: AnalytePack
  selected: boolean
  onSelect: () => void
  index: number
}) {
  const row = latestRowForAnalyte(analyte)
  const tone = categoryTone(row?.category)
  const trend = trendDirection(analyte)
  const pct = row ? ratioPercent(row) : null
  const chartData = analyte.by_year
    .filter((r) => r.max_concentration != null)
    .map((r) => ({
      year: r.year,
      m: r.max_concentration as number,
    }))

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onSelect}
      className={cn(
        'group flex w-full flex-col rounded-2xl bg-white/90 p-4 text-left shadow-sm ring-1 transition dark:bg-slate-900/80',
        selected
          ? 'ring-2 ring-sky-500 shadow-md dark:ring-sky-400'
          : cn('ring-slate-200/90 dark:ring-slate-700/90', toneRing[tone]),
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Measure
          </p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {analyte.analyte_name}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {row?.year ?? '—'}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest vs limit
          </p>
          <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
            {row?.max_concentration != null ? row.max_concentration : '—'}
            <span className="text-sm font-normal text-slate-500">
              {' '}
              {row?.unit ?? ''}
            </span>
          </p>
          <p className="text-xs text-slate-500">
            Limit {row?.sdwa_limit ?? '—'} {row?.unit ?? ''}
          </p>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          {trend === 'up' && <ArrowUpRight className="h-4 w-4" aria-label="Trend up" />}
          {trend === 'down' && (
            <ArrowDownRight className="h-4 w-4" aria-label="Trend down" />
          )}
          {trend === 'flat' && <Minus className="h-4 w-4" aria-label="Trend flat" />}
        </div>
      </div>

      {pct != null && (
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={cn('h-full rounded-full transition-all', barColor[tone])}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {pct.toFixed(0)}% of limit (higher is closer to the line)
          </p>
        </div>
      )}

      <div className="mt-3 h-12 w-full opacity-90 group-hover:opacity-100">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
              <XAxis dataKey="year" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
                formatter={(v) => [`${v ?? '—'}`, 'High reading']}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Line
                type="monotone"
                dataKey="m"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400">Not enough points for a mini trend.</p>
        )}
      </div>

      <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
        {row?.category ?? 'No category'}
      </p>
    </motion.button>
  )
}
