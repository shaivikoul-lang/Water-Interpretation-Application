import { useId } from 'react'
import { COPPER_COPY } from '../../lib/copperResult'

function PipeMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="10" y="28" width="68" height="12" rx="4" fill="#B45309" />
      <rect x="10" y="28" width="68" height="5" rx="2" fill="#F59E0B" opacity="0.45" />
      <circle cx="24" cy="34" r="7" fill="#92400E" />
      <circle cx="64" cy="34" r="7" fill="#92400E" />
      <path d="M40 18v10" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function FaucetMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="18" y="16" width="22" height="10" rx="3" fill="#B45309" />
      <path d="M36 21h18a8 8 0 0 1 8 8v4" stroke="#B45309" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M62 33v8" stroke="#7EC8E8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="62" cy="44" r="3.5" fill="#0B74DE" />
      <path d="M46 50h32l4 10H42Z" fill="#FFFFFF" stroke="#0B2A4A" strokeWidth="2" />
    </svg>
  )
}

function PlumbingMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="12" y="14" width="14" height="36" rx="3" fill="#0B2A4A" />
      <path d="M26 22h28" stroke="#B45309" strokeWidth="8" strokeLinecap="round" />
      <path d="M54 22v16" stroke="#B45309" strokeWidth="8" strokeLinecap="round" />
      <path d="M54 38h18" stroke="#B45309" strokeWidth="8" strokeLinecap="round" />
      <circle cx="40" cy="22" r="4" fill="#F59E0B" />
      <rect x="14" y="22" width="10" height="7" fill="#EAF4FC" />
    </svg>
  )
}

function CorrosionMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M16 42h40v8H16Z" fill="#B45309" />
      <circle cx="28" cy="28" r="8" fill="#C2410C" opacity="0.85" />
      <circle cx="42" cy="24" r="6" fill="#EA580C" />
      <circle cx="54" cy="30" r="5" fill="#F59E0B" />
      <path d="M36 36c4-8 14-6 16 4" stroke="#C2410C" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const SOURCES = [
  { label: 'Copper pipes', Mark: PipeMark },
  { label: 'Faucets and fixtures', Mark: FaucetMark },
  { label: 'Household plumbing', Mark: PlumbingMark },
  { label: 'Corrosion at the tap', Mark: CorrosionMark },
] as const

export function CopperPathwayVisual() {
  const uid = useId()
  const headingId = `${uid}-h`
  const sky = `${uid}-sky`
  const soil = `${uid}-soil`
  const water = `${uid}-water`

  return (
    <section className="pfas-path" aria-labelledby={headingId}>
      <h2 id={headingId} className="pfas-path__h">
        {COPPER_COPY.pathwayHeading}
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
          aria-label="Copper can enter drinking water from copper pipes, faucets, fixtures, and other household plumbing when water sits in those materials."
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
          <path d="M0 78c40-10 80 8 120 0s80-12 130 2 90 8 140-6 110 4 150 0 90-8 140 6v20H0Z" fill="#7A9A5C" />
          <path d="M48 96V58h52v38H48Z" fill="#0B2A4A" />
          <path d="M40 58h68l-34-26Z" fill="#C2410C" />
          <rect x="58" y="70" width="14" height="12" fill="#EAF4FC" />
          <rect x="78" y="70" width="14" height="12" fill="#EAF4FC" />
          <path d="M100 74h80" stroke="#B45309" strokeWidth="7" strokeLinecap="round" />
          <path d="M180 74v16" stroke="#B45309" strokeWidth="7" strokeLinecap="round" />
          <path d="M180 90h90" stroke="#B45309" strokeWidth="7" strokeLinecap="round" />
          <circle cx="140" cy="74" r="5" fill="#F59E0B" />
          <circle cx="180" cy="82" r="5" fill="#EA580C" />
          <g transform="translate(278 56)">
            <rect x="0" y="8" width="18" height="8" rx="2" fill="#B45309" />
            <path d="M16 12h16a7 7 0 0 1 7 7" stroke="#B45309" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M39 19v10" stroke="#7EC8E8" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 40h30l3 16H21Z" fill="#FFFFFF" stroke="#0B2A4A" strokeWidth="2" />
          </g>
          <rect x="0" y="96" width="680" height="26" fill={`url(#${soil})`} />
          <path d="M112 96v18" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />
          <path d="M24 118h200" stroke="#B45309" strokeWidth="8" strokeLinecap="round" />
          <path d="M0 122h680v46H0Z" fill={`url(#${water})`} />
        </svg>
        <figcaption className="pfas-path__caption">{COPPER_COPY.pathwayCaption}</figcaption>
      </figure>
    </section>
  )
}
