import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalytePack } from '../types/water'

export function TrendPanel({ analyte }: { analyte: AnalytePack }) {
  const limit = analyte.by_year.find((r) => r.sdwa_limit != null)?.sdwa_limit ?? null
  const data = analyte.by_year
    .filter((r) => r.max_concentration != null)
    .map((r) => ({
      year: r.year,
      high: r.max_concentration,
      limit: r.sdwa_limit ?? limit,
      category: r.category,
    }))

  return (
    <motion.section
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900/70 dark:ring-slate-700/80 sm:p-6"
    >
      <div className="mb-4 text-left">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Trend vs limit
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {analyte.analyte_name} — highest reported level each year (public data).
        </p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={36} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                fontSize: 12,
              }}
              formatter={(value, name) => {
                const v = value ?? '—'
                if (name === 'high') return [`${v}`, 'Highest level']
                return [`${v}`, 'Limit']
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {limit != null && (
              <ReferenceLine
                y={limit}
                stroke="#f97316"
                strokeDasharray="6 4"
                label={{
                  value: 'Limit in file',
                  position: 'insideTopRight',
                  fill: '#ea580c',
                  fontSize: 11,
                }}
              />
            )}
            <Line type="monotone" dataKey="high" name="Highest level" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
