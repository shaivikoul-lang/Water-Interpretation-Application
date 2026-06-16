import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  LayoutGrid,
  LineChart as LineChartIcon,
  Moon,
  Sun,
  Table2,
} from 'lucide-react'
import { ContaminantCard } from './components/ContaminantCard'
import { EducationAside } from './components/EducationAside'
import { HeroSnapshot } from './components/HeroSnapshot'
import { TopicGuide } from './components/TopicGuide'
import { TrendPanel } from './components/TrendPanel'
import { TrustFooter } from './components/TrustFooter'
import { TopicsHub, type TopicId } from './components/TopicsHub'
import { cn } from './lib/cn'
import { heroSafetyStatus, measureSummaryCounts, overallStatus, watchAlertCopy } from './lib/derive'
import type { EducationPayload, PwsPayload } from './types/water'

function dataUrl(path: string) {
  const base = import.meta.env.BASE_URL
  const p = base.endsWith('/') ? base : `${base}/`
  return `${p}${path.replace(/^\//, '')}`
}

/** Classic PWS page; avoids `../index.html` from `.../dashboard/dist/` resolving to `dashboard/index.html` (redirect loop). */
function classicLayoutHref(): string {
  if (typeof window === 'undefined') return '../index.html'
  const { pathname, search, hash } = window.location
  const next = pathname.replace(/\/dashboard\/dist\/?(?:index\.html)?\/?$/i, '/index.html')
  return next !== pathname ? `${next}${search}${hash}` : `../index.html${search}${hash}`
}

export default function App() {
  const [water, setWater] = useState<PwsPayload | null>(null)
  const [education, setEducation] = useState<EducationPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'overview' | 'detail'>('overview')
  const [activeTopic, setActiveTopic] = useState<TopicId | null>(null)
  const [guideTopic, setGuideTopic] = useState<
    Extract<TopicId, 'hard-water' | 'taste-odor'> | null
  >(null)
  const [highlightName, setHighlightName] = useState<string | null>(null)
  const [topicNotice, setTopicNotice] = useState<string | null>(null)
  const dataSectionRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const pendingScrollName = useRef<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    if (guideTopic) {
      guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [guideTopic])

  useEffect(() => {
    const name = pendingScrollName.current
    if (!guideTopic && name) {
      pendingScrollName.current = null
      const card = cardRefs.current[name]
      const cardVisible = !!card && card.offsetParent !== null
      const target = cardVisible ? card : dataSectionRef.current
      target?.scrollIntoView({
        behavior: 'smooth',
        block: cardVisible ? 'center' : 'start',
      })
    }
  }, [guideTopic, selected, mobileTab])

  useEffect(() => {
    if (!highlightName) return
    const timer = window.setTimeout(() => setHighlightName(null), 1800)
    return () => window.clearTimeout(timer)
  }, [highlightName])

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
  const safetyTone = water ? heroSafetyStatus(water.analytes) : 'calm'
  const measureSummary = water ? measureSummaryCounts(water.analytes) : { safe: 0, moderate: 0, above: 0 }

  const yearSpan =
    water?.years_present?.length && water.years_present.length >= 2
      ? `${water.years_present[0]}–${water.years_present[water.years_present.length - 1]}`
      : water?.years_present?.[0]?.toString() ?? '—'

  const classicHref = useMemo(() => classicLayoutHref(), [])

  const scrollToMeasure = useCallback((name: string) => {
    setSelected(name)
    setMobileTab('overview')
    setHighlightName(name)
    pendingScrollName.current = name
  }, [])

  const handleTopicSelect = useCallback(
    (topic: TopicId) => {
      setActiveTopic(topic)

      if (topic === 'hard-water' || topic === 'taste-odor') {
        setGuideTopic(topic)
        setTopicNotice(null)
        setHighlightName(null)
        return
      }

      setGuideTopic(null)
      const analyte =
        topic === 'pfas'
          ? (water?.analytes.find((a) => a.analyte_name === 'PFOA') ??
            water?.analytes.find((a) => a.analyte_name.startsWith('PF')))
          : (water?.analytes.find((a) => a.analyte_name === 'Lead') ??
            water?.analytes.find((a) => a.analyte_name === 'Copper'))

      if (analyte) {
        setSelected(analyte.analyte_name)
        const isMobile = window.matchMedia('(max-width: 1023px)').matches
        setMobileTab(isMobile ? 'detail' : 'overview')
        setTopicNotice(
          topic === 'pfas'
            ? 'Showing PFAS-related measures'
            : 'Showing Lead & Copper-related measures',
        )
        setHighlightName(analyte.analyte_name)
        pendingScrollName.current = analyte.analyte_name
      }
    },
    [water?.analytes],
  )

  const topBar = (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={classicHref}
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#005ea2] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004880] dark:bg-sky-600 dark:hover:bg-sky-500"
          title="Open the tables view (same as the classic layout)"
        >
          <Table2 className="h-4 w-4 shrink-0" aria-hidden />
          Classic view
        </a>
        <a
          href="../../../../index.html"
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#005ea2] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004880] dark:bg-sky-600 dark:hover:bg-sky-500"
          title="Back to the home page"
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden />
          Home page
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="https://forms.gle/2s4VAYnTX4EzFsvy5"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Share feedback about this tool"
        >
          Share feedback
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
          yearSpan={yearSpan}
          tone={tone}
          safetyTone={safetyTone}
          summary={measureSummary}
          watchCopy={tone === 'watch' ? watchAlertCopy(water.analytes) : undefined}
          onViewAffected={scrollToMeasure}
        />

        <TopicsHub activeTopic={activeTopic} onSelectTopic={handleTopicSelect} />

        {guideTopic ? (
          <motion.div
            key={`guide-${guideTopic}`}
            ref={guideRef}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-8 scroll-mt-6"
          >
            <TopicGuide
              topic={guideTopic}
              onClose={() => {
                setGuideTopic(null)
                setActiveTopic(null)
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="data-mode"
            ref={dataSectionRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-8 space-y-8 scroll-mt-6"
          >
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
                <div>
                  <h2 className="text-left text-lg font-semibold text-slate-900 dark:text-white">
                    Recent monitoring results
                  </h2>
                  <p className="mt-0.5 text-left text-sm text-slate-500 dark:text-slate-400">
                    Latest reported values across regulated contaminants.
                  </p>
                  {topicNotice && (
                    <motion.p
                      key={topicNotice}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left text-sm font-medium text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200"
                      role="status"
                    >
                      {topicNotice}
                    </motion.p>
                  )}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {water.analytes.map((a, i) => (
                      <ContaminantCard
                        key={a.analyte_name}
                        ref={(el) => {
                          cardRefs.current[a.analyte_name] = el
                        }}
                        analyte={a}
                        selected={selected === a.analyte_name}
                        highlighted={highlightName === a.analyte_name}
                        onSelect={() => {
                          setSelected(a.analyte_name)
                          setMobileTab('detail')
                          setTopicNotice(null)
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

            <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
              <EducationAside analyte={selectedAnalyte} education={education} sticky={false} />
            </aside>
          </div>
        </motion.div>
        )}

        <TrustFooter />
      </div>
    </div>
  )
}
