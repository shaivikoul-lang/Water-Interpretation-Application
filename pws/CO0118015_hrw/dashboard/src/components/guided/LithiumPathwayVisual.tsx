import { useId } from 'react'
import { LITHIUM_COPY } from '../../lib/lithiumResult'

function Crystal({ x, y, fill, size = 5 }: { x: number; y: number; fill: string; size?: number }) {
  const s = size
  return (
    <path d={`M${x} ${y - s} L${x + s * 0.7} ${y} L${x} ${y + s} L${x - s * 0.7} ${y} Z`} fill={fill} />
  )
}

function RockMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M10 50 24 20l20 8 14-14 18 18 8 18H10Z" fill="#64748B" />
      <path d="M10 50 24 20l20 8 6 22H10Z" fill="#94A3B8" />
      <Crystal x={30} y={34} fill="#E2E8F0" size={5} />
      <Crystal x={52} y={30} fill="#CBD5E1" size={4} />
    </svg>
  )
}

function GroundwaterMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M10 18h68v10H10Z" fill="#C8B48A" />
      <path d="M10 28h68v26H10Z" fill="#0B74DE" />
      <rect x="40" y="8" width="8" height="28" rx="1.5" fill="#0B2A4A" />
      <Crystal x={26} y={42} fill="#E2E8F0" size={4} />
      <Crystal x={60} y={46} fill="#FFFFFF" size={3.5} />
    </svg>
  )
}

function MineralMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <circle cx="44" cy="34" r="18" fill="#334E68" />
      <circle cx="44" cy="34" r="11" fill="#EAF4FC" />
      <Crystal x={44} y={34} fill="#64748B" size={6} />
      <Crystal x={58} y={22} fill="#94A3B8" size={4} />
    </svg>
  )
}

function MonitorMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="14" y="16" width="44" height="28" rx="4" fill="#0B2A4A" />
      <rect x="18" y="20" width="36" height="18" fill="#EAF4FC" />
      <path d="M32 44h8v8h-8Z" fill="#334E68" />
      <path d="M24 52h24" stroke="#0B2A4A" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 28h10" stroke="#0B74DE" strokeWidth="3" strokeLinecap="round" />
      <circle cx="70" cy="40" r="10" fill="#EAF4FC" stroke="#0B2A4A" strokeWidth="2" />
      <path d="M66 40h8M70 36v8" stroke="#005EA8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const SOURCES = [
  { label: 'Rock and soil', Mark: RockMark },
  { label: 'Groundwater', Mark: GroundwaterMark },
  { label: 'Natural minerals', Mark: MineralMark },
  { label: 'UCMR monitoring', Mark: MonitorMark },
] as const

export function LithiumPathwayVisual() {
  const uid = useId()
  const headingId = `${uid}-h`
  const sky = `${uid}-sky`
  const soil = `${uid}-soil`
  const water = `${uid}-water`

  return (
    <section className="pfas-path" aria-labelledby={headingId}>
      <h2 id={headingId} className="pfas-path__h">
        {LITHIUM_COPY.pathwayHeading}
      </h2>
      <ul className="pfas-path__sources">
        {SOURCES.map(({ label, Mark }) => (
          <li key={label} className="pfas-path__source">
            <Mark />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <figure className="pfas-path__figure">
        <svg
          className="pfas-path__scene"
          viewBox="0 0 680 168"
          role="img"
          aria-label="Lithium can move from rock and soil into groundwater, then through treatment before it is monitored at the entry point."
        >
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F7FAFC" />
              <stop offset="1" stopColor="#EAF4FC" />
            </linearGradient>
            <linearGradient id={soil} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#C8B48A" />
              <stop offset="1" stopColor="#8F7A52" />
            </linearGradient>
            <linearGradient id={water} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7EC8E8" />
              <stop offset="1" stopColor="#0B74DE" />
            </linearGradient>
          </defs>
          <rect width="680" height="168" rx="14" fill={`url(#${sky})`} />
          <path d="M0 78 70 30l48 16 40-24 70 32v24H0Z" fill="#64748B" />
          <path d="M0 78c40-8 90 6 140 0 50 8 110-8 180 2v18H0Z" fill="#7A9A5C" />
          <Crystal x={48} y={56} fill="#E2E8F0" size={6} />
          <Crystal x={88} y={48} fill="#CBD5E1" size={4} />
          <rect x="400" y="58" width="46" height="34" rx="4" fill="#0B2A4A" />
          <rect x="452" y="50" width="22" height="42" rx="11" fill="#334E68" />
          <rect x="0" y="92" width="680" height="28" fill={`url(#${soil})`} />
          <Crystal x={120} y={106} fill="#94A3B8" size={4} />
          <Crystal x={280} y={104} fill="#E2E8F0" size={5} />
          <path d="M0 120h680v48H0Z" fill={`url(#${water})`} />
          <Crystal x={160} y={140} fill="#FFFFFF" size={4} />
          <g transform="translate(548 70)">
            <path d="M36 6h28v10H36Z" fill="#0B2A4A" />
            <path d="M58 16v10" stroke="#0B2A4A" strokeWidth="6" strokeLinecap="round" />
            <path d="M58 26h18" stroke="#0B2A4A" strokeWidth="6" strokeLinecap="round" />
            <path d="M76 26v12" stroke="#7EC8E8" strokeWidth="4" strokeLinecap="round" />
            <path d="M66 48h24l3 22H63Z" fill="#FFFFFF" stroke="#0B2A4A" strokeWidth="2.2" />
          </g>
        </svg>
        <figcaption className="pfas-path__caption">{LITHIUM_COPY.pathwayCaption}</figcaption>
      </figure>
    </section>
  )
}
