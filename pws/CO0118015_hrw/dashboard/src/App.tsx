import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, LineChart as LineChartIcon, Moon, Sun } from 'lucide-react'
import { AttentionSection } from './components/AttentionSection'
import { ContaminantCard } from './components/ContaminantCard'
import { EducationAside } from './components/EducationAside'
import { HeroSnapshot } from './components/HeroSnapshot'
import { TrendPanel } from './components/TrendPanel'
import { TrustFooter } from './components/TrustFooter'
import { cn } from './lib/cn'
import { overallStatus } from './lib/derive'
import type { EducationPayload, PwsPayload } from './types/water'

function dataUrl(path: string) {
  const base = import.meta.env.BASE_URL
  const p = base.endsWith('/') ? base : `${base}/`
  return `${p}${path.replace(/^\//, '')}`
}

export default function App() {
  const [water, setWater] = useState<PwsPayload | null>(null)
  const [education, setEducation] = useState<EducationPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'overview' | 'detail'>('overview')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [wRes, eRes] = await Promise.all([
          fetch(dataUrl('data/output.json')),
          fetch(dataUrl('data/education.json')),
        ])
        if (!wRes.ok) throw new Error('Could not load water data.')
        const w = (await wRes.json()) as PwsPayload
        if (cancelled) return
        setWater(w)
        if (w.analytes[0]) setSelected(w.analytes[0].analyte_name)
        if (eRes.ok) {
          setEducation((await eRes.json()) as EducationPayload)
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedAnalyte = useMemo(() => {
    if (!water || !selected) return null
    return water.analytes.find((a) => a.analyte_name === selected) ?? null
  }, [water, selected])

  const tone = water ? overallStatus(water.analytes) : 'calm'

  const yearSpan =
    water?.years_present?.length && water.years_present.length >= 2
      ? `${water.years_present[0]}–${water.years_present[water.years_present.length - 1]}`
      : water?.years_present?.[0]?.toString() ?? '—'

  const topBar = (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <a
        href="../index.html"
        className="text-sm font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-400"
      >
        Classic layout
      </a>
      <button
        type="button"
        onClick={() => setDark((d) => !d)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {dark ? 'Light' : 'Dark'}
      </button>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-svh font-sans text-[15px] leading-relaxed">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {topBar}
          <div className="flex min-h-[50vh] items-center justify-center p-6">
            <p className="max-w-md text-center text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!water || !selectedAnalyte) {
    return (
      <div className="min-h-svh font-sans text-[15px] leading-relaxed">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {topBar}
          <div className="flex min-h-[50vh] items-center justify-center p-6">
            <p className="animate-pulse text-slate-500">Loading snapshot…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh font-sans text-[15px] leading-relaxed">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {topBar}

        <HeroSnapshot
          utilityLabel={water.pws_label}
          pwsId={water.pws_id_number}
          yearSpan={yearSpan}
          generatedAt={water.generated_at}
          tone={tone}
        />

        <div className="mt-8 space-y-8">
          <div className="flex gap-2 rounded-2xl bg-slate-200/60 p-1 dark:bg-slate-800/80 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('overview')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition',
                mobileTab === 'overview'
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('detail')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition',
                mobileTab === 'detail'
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400',
              )}
            >
              <LineChartIcon className="h-4 w-4" />
              Chart & learn
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(20rem,32%)] lg:items-start">
            <div className="min-w-0 space-y-8">
              <div
                className={cn(
                  mobileTab !== 'overview' && 'hidden',
                  'space-y-6 lg:block',
                )}
              >
                <AttentionSection
                  exceedances={water.exceedances_all_years}
                  analytes={water.analytes}
                />
                <div>
                  <h2 className="mb-3 text-left text-lg font-semibold text-slate-900 dark:text-white">
                    Key measures
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {water.analytes.map((a, i) => (
                      <ContaminantCard
                        key={a.analyte_name}
                        analyte={a}
                        selected={selected === a.analyte_name}
                        onSelect={() => {
                          setSelected(a.analyte_name)
                          setMobileTab('detail')
                        }}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  mobileTab !== 'detail' && 'hidden',
                  'space-y-6 lg:block',
                )}
              >
                <TrendPanel analyte={selectedAnalyte} />
                <div className="lg:hidden">
                  <EducationAside analyte={selectedAnalyte} education={education} />
                </div>
              </div>
            </div>

            <aside className="hidden lg:block">
              <EducationAside analyte={selectedAnalyte} education={education} />
            </aside>
          </div>
        </div>

        <TrustFooter />
      </div>
    </div>
  )
}
