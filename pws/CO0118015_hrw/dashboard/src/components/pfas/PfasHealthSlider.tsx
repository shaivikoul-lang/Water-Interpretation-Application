import { useId, useState } from 'react'
import { Activity, Baby, Check, Droplets, ExternalLink, Heart, HeartPulse, Shield } from 'lucide-react'
import { formatPpt } from '../../lib/pfasShowcase'
import { getSource } from '../../lib/sourceRegistry'

type Tone = 'goal' | 'official' | 'rising' | 'limit'

type Zone = {
  tone: Tone
  title: string
  fact: string
  official: boolean
}

function zoneFor(value: number, official: number, mcl: number): Zone {
  if (value <= 0.02) {
    return {
      tone: 'goal',
      title: 'EPA’s health goal',
      fact: 'EPA wants PFOA as close to 0 as possible because health effects can begin at very small amounts, especially for children who drink the water over years.',
      official: false,
    }
  }
  if (Math.abs(value - official) < 0.03) {
    return {
      tone: 'official',
      title: 'Where Highlands Ranch Water is',
      fact: `${formatPpt(official)} ppt is the latest official average. It is under the 4.0 ppt legal limit. EPA still wants the number as low as possible.`,
      official: true,
    }
  }
  if (value < official) {
    return {
      tone: 'goal',
      title: 'Lower than today’s official average',
      fact: 'This is not the utility result. It is closer to 0, the number EPA would choose for health.',
      official: false,
    }
  }
  if (value < mcl - 0.02) {
    return {
      tone: 'rising',
      title: 'Higher, still under the legal limit',
      fact: 'This is not the utility result. A water system can be here and still meet the 4.0 ppt rule. EPA does not say a new health effect starts at this number.',
      official: false,
    }
  }
  return {
    tone: 'limit',
    title: 'The legal limit',
    fact: '4.0 ppt is the most PFOA EPA allows in tap water. A water system at this level would have to tell the public and bring the number down. This is not Highlands Ranch Water’s result.',
    official: false,
  }
}

export function PfasEpaHealthCard({ officialPpt }: { officialPpt: number }) {
  const hrwPfas = getSource('hrw_pfas')
  const epaHealth = getSource('epa_pfas_health')

  return (
    <section className="pfas-card pfas-epa" aria-labelledby="pfas-epa-heading">
      <h2 id="pfas-epa-heading" className="pfas-sec-h">
        What EPA says about PFAS and health
      </h2>
      <p className="pfas-copy">
        EPA lists possible effects of PFAS exposure. It does not assign these to Highlands Ranch
        Water’s {formatPpt(officialPpt)} ppt.
      </p>
      <HealthStakes hrwUrl={hrwPfas.url} epaUrl={epaHealth.url} />
    </section>
  )
}

function HealthStakes({ hrwUrl, epaUrl }: { hrwUrl: string; epaUrl: string }) {
  return (
    <>
      <p className="pfas-stat-k pfas-health__stakes-k">EPA says PFAS exposure may lead to</p>
      <ul className="pfas-health__stakes">
        <li>
          <Shield className="h-4 w-4" aria-hidden />
          A weaker ability to fight infections
        </li>
        <li>
          <Baby className="h-4 w-4" aria-hidden />
          Developmental delays in children
        </li>
        <li>
          <HeartPulse className="h-4 w-4" aria-hidden />
          Higher risk of some cancers
        </li>
        <li>
          <Heart className="h-4 w-4" aria-hidden />
          Effects on fertility and pregnancy
        </li>
        <li>
          <Activity className="h-4 w-4" aria-hidden />
          Interference with hormones
        </li>
        <li>
          <Droplets className="h-4 w-4" aria-hidden />
          Higher cholesterol
        </li>
      </ul>
      <p className="pfas-health__stakes-note">
        That list is from EPA’s PFAS health-risks page. EPA does not assign these effects to one
        part-per-trillion number.
      </p>
      <div className="pfas-health__links">
        <a className="pfas-text-link" href={hrwUrl} target="_blank" rel="noreferrer">
          Highlands Ranch Water PFAS page
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a className="pfas-text-link" href={epaUrl} target="_blank" rel="noreferrer">
          EPA: how PFAS can affect health
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </>
  )
}

export function PfasHealthSlider({
  officialPpt,
  mclPpt,
  compact = false,
}: {
  officialPpt: number
  mclPpt: number
  compact?: boolean
}) {
  const sliderId = useId()
  const [value, setValue] = useState(officialPpt)
  const zone = zoneFor(value, officialPpt, mclPpt)
  const hrwPfas = getSource('hrw_pfas')
  const epaHealth = getSource('epa_pfas_health')
  const fillPct = (value / mclPpt) * 100

  return (
    <section
      className={`pfas-health${compact ? ' pfas-health--stage' : ''}`}
      aria-labelledby="pfas-health-heading"
    >
      <h2 id="pfas-health-heading" className="pfas-health__h">
        What if PFOA were higher?
      </h2>
      <p className="pfas-health__intro">
        {compact
          ? `Today’s official average is ${formatPpt(officialPpt)} ppt. This is not a new utility result. Drag toward the ${formatPpt(mclPpt)} ppt limit to see what that means.`
          : `Today’s official average is ${formatPpt(officialPpt)} ppt. The most EPA allows is ${formatPpt(mclPpt)} ppt. Drag toward the limit to see what that means.`}
      </p>

      <dl className="pfas-health__pair">
        <div>
          <dt>Health goal</dt>
          <dd>0 ppt</dd>
        </div>
        <div>
          <dt>Legal limit</dt>
          <dd>{formatPpt(mclPpt)} ppt</dd>
        </div>
      </dl>

      <p className={`pfas-health__value pfas-health__value--${zone.tone}`}>
        {formatPpt(value)}
        <span>{zone.official ? 'ppt official average' : 'ppt — not the utility result'}</span>
      </p>

      <label className="sr-only" htmlFor={sliderId}>
        Explore a PFOA level from 0 to {formatPpt(mclPpt)} parts per trillion
      </label>
      <div className="pfas-health__track-wrap">
        <div className="pfas-health__rail" aria-hidden>
          <span
            className={`pfas-health__fill pfas-health__fill--${zone.tone}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <input
          id={sliderId}
          className="pfas-health__range"
          type="range"
          min={0}
          max={mclPpt}
          step={0.01}
          value={value}
          aria-valuemin={0}
          aria-valuemax={mclPpt}
          aria-valuenow={Number(value.toFixed(2))}
          aria-valuetext={`${formatPpt(value)} parts per trillion. ${zone.title}`}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>
      <div className="pfas-health__ticks" aria-hidden>
        <span>0</span>
        <span>4.0</span>
      </div>

      <div className={`pfas-health__zone pfas-health__zone--${zone.tone}`}>
        {zone.tone === 'official' || zone.tone === 'goal' ? (
          <span className="pfas-limit-hint__mark" aria-hidden>
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        ) : null}
        <div>
          <p className="pfas-health__zone-title">{zone.title}</p>
          <p className="pfas-copy">{zone.fact}</p>
        </div>
      </div>

      {!zone.official ? (
        <button type="button" className="pfas-text-link" onClick={() => setValue(officialPpt)}>
          Show the official {formatPpt(officialPpt)} ppt
        </button>
      ) : null}

      {compact ? null : <HealthStakes hrwUrl={hrwPfas.url} epaUrl={epaHealth.url} />}
    </section>
  )
}
