import { useId } from 'react'
import { ARSENIC_COPY } from '../../lib/arsenicResult'

function Crystal({
  x,
  y,
  fill,
  size = 5,
}: {
  x: number
  y: number
  fill: string
  size?: number
}) {
  const s = size
  return (
    <path
      d={`M${x} ${y - s} L${x + s * 0.75} ${y} L${x} ${y + s} L${x - s * 0.75} ${y} Z`}
      fill={fill}
    />
  )
}

function RockMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M8 50 22 22l18 6 16-16 16 20 8 18H8Z" fill="#6B5344" />
      <path d="M8 50 22 22l18 6 4 22H8Z" fill="#8A6A52" />
      <path d="M40 50 44 28l12-16 16 20 4 18H40Z" fill="#4E3B30" />
      <path d="M14 50h60v6H14Z" fill="#8F7A52" />
      <Crystal x={28} y={36} fill="#D97706" size={5} />
      <Crystal x={52} y={30} fill="#B45309" size={4} />
      <Crystal x={64} y={40} fill="#F59E0B" size={3.5} />
    </svg>
  )
}

function GroundwaterMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M10 18h68v10H10Z" fill="#C8B48A" />
      <path d="M10 28h68v26H10Z" fill="#0B74DE" />
      <path d="M10 34c10 6 16-4 26 0s16 8 26 0 16-6 16 2v18H10Z" fill="#005EA8" opacity="0.45" />
      <rect x="40" y="8" width="8" height="28" rx="1.5" fill="#0B2A4A" />
      <rect x="38" y="6" width="12" height="5" rx="1" fill="#334E68" />
      <Crystal x={24} y={42} fill="#F8E8C8" size={4} />
      <Crystal x={62} y={46} fill="#FDE68A" size={3.5} />
    </svg>
  )
}

function OrchardIndustryMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <circle cx="24" cy="28" r="12" fill="#3F7A3A" />
      <circle cx="34" cy="26" r="9" fill="#5A9A4E" />
      <path d="M26 34v16" stroke="#6B5344" strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="32" r="3" fill="#C2410C" />
      <circle cx="30" cy="30" r="2.5" fill="#C2410C" />
      <path d="M50 52V30l10-8 10 8v22H50Z" fill="#0B2A4A" />
      <rect x="72" y="34" width="10" height="18" fill="#334E68" />
      <rect x="54" y="36" width="6" height="6" fill="#EAF4FC" />
      <rect x="64" y="36" width="6" height="6" fill="#EAF4FC" />
      <path d="M58 10c4-6 10 0 7 8" stroke="#B45309" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M68 8c4-6 10 0 7 8" stroke="#D97706" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function TreatmentMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="10" y="30" width="28" height="22" rx="3" fill="#0B2A4A" />
      <rect x="42" y="24" width="20" height="28" rx="10" fill="#334E68" />
      <rect x="66" y="28" width="14" height="24" rx="7" fill="#0B74DE" />
      <path d="M14 22h20v8H14Z" fill="#526D82" />
      <circle cx="52" cy="32" r="5" fill="#EAF4FC" />
      <circle cx="73" cy="36" r="4" fill="#EAF4FC" />
      <path d="M24 16c1 6 0 10-2 14" stroke="#7EC8E8" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M38 38h8" stroke="#7EC8E8" strokeWidth="3" strokeLinecap="round" />
      <path d="M62 38h6" stroke="#7EC8E8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const SOURCES = [
  { label: 'Rock and soil', Mark: RockMark },
  { label: 'Groundwater', Mark: GroundwaterMark },
  { label: 'Orchards and industry', Mark: OrchardIndustryMark },
  { label: 'Treatment at the plant', Mark: TreatmentMark },
] as const

export function ArsenicPathwayVisual() {
  const uid = useId()
  const headingId = `${uid}-h`
  const sky = `${uid}-sky`
  const soil = `${uid}-soil`
  const water = `${uid}-water`
  const rock = `${uid}-rock`

  return (
    <section className="pfas-path" aria-labelledby={headingId}>
      <h2 id={headingId} className="pfas-path__h">
        {ARSENIC_COPY.pathwayHeading}
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
          aria-label="Arsenic can move from rock and soil into groundwater, and from orchard or industrial runoff, then through treatment before it reaches a tap."
        >
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F7FAFC" />
              <stop offset="1" stopColor="#EAF4FC" />
            </linearGradient>
            <linearGradient id={rock} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8A6A52" />
              <stop offset="1" stopColor="#4E3B30" />
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

          <path d="M0 78 70 28l50 18 46-30 70 36 40-12 70 22v16H0Z" fill="#7A9A5C" />
          <path d="M0 78 58 40l36 16 28-22 48 28v16H0Z" fill={`url(#${rock})`} />
          <Crystal x={36} y={58} fill="#D97706" size={6} />
          <Crystal x={78} y={50} fill="#F59E0B" size={4.5} />
          <Crystal x={54} y={68} fill="#B45309" size={4} />

          <circle cx="210" cy="66" r="16" fill="#3F7A3A" />
          <circle cx="228" cy="62" r="12" fill="#5A9A4E" />
          <path d="M216 74v16" stroke="#6B5344" strokeWidth="5" strokeLinecap="round" />
          <circle cx="206" cy="70" r="3.5" fill="#C2410C" />
          <circle cx="222" cy="68" r="3" fill="#C2410C" />
          <circle cx="258" cy="68" r="12" fill="#3F7A3A" />
          <path d="M256 76v14" stroke="#6B5344" strokeWidth="4" strokeLinecap="round" />

          <path d="M300 92V58l18-12 18 12v34H300Z" fill="#0B2A4A" />
          <rect x="340" y="68" width="22" height="24" fill="#334E68" />
          <rect x="306" y="70" width="8" height="8" fill="#EAF4FC" />
          <rect x="320" y="70" width="8" height="8" fill="#EAF4FC" />
          <path d="M312 42c5-7 12 0 9 10" stroke="#B45309" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M328 38c5-7 12 0 9 10" stroke="#D97706" strokeWidth="2.4" fill="none" strokeLinecap="round" />

          <rect x="400" y="58" width="46" height="34" rx="4" fill="#0B2A4A" />
          <rect x="452" y="50" width="22" height="42" rx="11" fill="#334E68" />
          <rect x="480" y="56" width="16" height="36" rx="8" fill="#0B74DE" />
          <circle cx="463" cy="64" r="5" fill="#EAF4FC" />
          <path d="M446 74h10" stroke="#7EC8E8" strokeWidth="3" strokeLinecap="round" />

          <rect x="0" y="92" width="680" height="28" fill={`url(#${soil})`} />
          <Crystal x={90} y={106} fill="#B45309" size={4} />
          <Crystal x={250} y={104} fill="#D97706" size={5} />
          <Crystal x={420} y={108} fill="#F59E0B" size={3.5} />

          <path d="M0 120h680v48H0Z" fill={`url(#${water})`} />
          <path
            d="M0 128c30 8 60-8 90 0s60 10 90 0 60-10 90 0 60 10 90 0 60-8 90 0 60 10 90 0 70-8 140 2v38H0Z"
            fill="#005EA8"
            opacity="0.35"
          />
          <Crystal x={120} y={140} fill="#F8E8C8" size={4} />
          <Crystal x={300} y={144} fill="#FFFFFF" size={3.5} />
          <Crystal x={470} y={138} fill="#FDE68A" size={4} />

          <path
            d="M70 72 C90 96 110 110 140 128"
            fill="none"
            stroke="#B45309"
            strokeWidth="2"
            strokeDasharray="4 6"
            opacity="0.7"
          />
          <path
            d="M320 92 C340 110 380 122 430 128"
            fill="none"
            stroke="#B45309"
            strokeWidth="2"
            strokeDasharray="4 6"
            opacity="0.55"
          />

          <g transform="translate(548 70)">
            <path d="M36 6h28v10H36Z" fill="#0B2A4A" />
            <path d="M58 16v10" stroke="#0B2A4A" strokeWidth="6" strokeLinecap="round" />
            <path d="M58 26h18" stroke="#0B2A4A" strokeWidth="6" strokeLinecap="round" />
            <path d="M76 26v12" stroke="#7EC8E8" strokeWidth="4" strokeLinecap="round" />
            <path d="M66 48h24l3 22H63Z" fill="#FFFFFF" stroke="#0B2A4A" strokeWidth="2.2" />
            <path d="M66 62h24" fill="none" stroke="#0B74DE" strokeWidth="10" opacity="0.35" />
          </g>
        </svg>
        <figcaption className="pfas-path__caption">{ARSENIC_COPY.pathwayCaption}</figcaption>
      </figure>
    </section>
  )
}
