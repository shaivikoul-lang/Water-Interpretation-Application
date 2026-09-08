import { useId } from 'react'
import { LEAD_COPY } from '../../lib/leadResult'

function SolderMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="8" y="34" width="30" height="12" rx="3" fill="#0B2A4A" />
      <rect x="50" y="34" width="30" height="12" rx="3" fill="#334E68" />
      <rect x="34" y="32" width="20" height="16" rx="3" fill="#526D82" />
      <circle cx="44" cy="26" r="9" fill="#C2410C" />
      <path d="M40 18c8-10 16-2 12 10" stroke="#EA580C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M44 36v10" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
      <circle cx="44" cy="50" r="3" fill="#EA580C" />
    </svg>
  )
}

function FaucetMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="18" y="16" width="22" height="10" rx="3" fill="#0B2A4A" />
      <path d="M36 21h18a8 8 0 0 1 8 8v4" stroke="#0B2A4A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M62 33v8" stroke="#7EC8E8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="62" cy="44" r="3.5" fill="#0B74DE" />
      <path d="M46 50h32l4 10H42Z" fill="#FFFFFF" stroke="#0B2A4A" strokeWidth="2" />
      <rect x="16" y="26" width="8" height="16" rx="2" fill="#334E68" />
    </svg>
  )
}

function PlumbingMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <rect x="10" y="12" width="14" height="40" rx="3" fill="#0B2A4A" />
      <path d="M24 20h28" stroke="#334E68" strokeWidth="8" strokeLinecap="round" />
      <path d="M52 20v16" stroke="#334E68" strokeWidth="8" strokeLinecap="round" />
      <path d="M52 36h18" stroke="#334E68" strokeWidth="8" strokeLinecap="round" />
      <circle cx="36" cy="20" r="5" fill="#C2410C" />
      <circle cx="52" cy="28" r="4.5" fill="#EA580C" />
      <circle cx="64" cy="36" r="4" fill="#C2410C" />
      <rect x="12" y="20" width="10" height="7" fill="#EAF4FC" />
      <rect x="12" y="34" width="10" height="7" fill="#EAF4FC" />
    </svg>
  )
}

function ServiceLineMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M14 18h22v16H14Z" fill="#0B2A4A" />
      <path d="M12 18h26l-13-10Z" fill="#C2410C" />
      <path d="M8 46h72" stroke="#0B74DE" strokeWidth="7" strokeLinecap="round" />
      <path d="M24 34v12" stroke="#334E68" strokeWidth="5" strokeLinecap="round" />
      <circle cx="66" cy="24" r="13" fill="#E7F6EE" />
      <path d="M60 24l5 5 9-10" fill="none" stroke="#157A45" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SOURCES = [
  { label: 'Older solder', Mark: SolderMark },
  { label: 'Faucets and fixtures', Mark: FaucetMark },
  { label: 'Household plumbing', Mark: PlumbingMark },
  { label: 'No lead service lines', Mark: ServiceLineMark },
] as const

export function LeadPathwayVisual() {
  const uid = useId()
  const headingId = `${uid}-h`
  const sky = `${uid}-sky`
  const soil = `${uid}-soil`
  const water = `${uid}-water`

  return (
    <section className="pfas-path" aria-labelledby={headingId}>
      <h2 id={headingId} className="pfas-path__h">
        {LEAD_COPY.pathwayHeading}
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
          aria-label="Lead can enter drinking water from household solder, faucets, fixtures, and other plumbing. Highlands Ranch Water reports no lead service lines in its service area."
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
          <circle cx="300" cy="68" r="12" fill="#3F7A3A" />
          <circle cx="314" cy="66" r="9" fill="#5A9A4E" />
          <circle cx="430" cy="70" r="10" fill="#3F7A3A" />

          <path d="M48 96V58h52v38H48Z" fill="#0B2A4A" />
          <path d="M40 58h68l-34-26Z" fill="#C2410C" />
          <rect x="58" y="70" width="14" height="12" fill="#EAF4FC" />
          <rect x="78" y="70" width="14" height="12" fill="#EAF4FC" />
          <rect x="68" y="82" width="12" height="14" fill="#334E68" />
          <path d="M92 46h8v12h-8Z" fill="#526D82" />

          <path d="M100 74h70" stroke="#334E68" strokeWidth="7" strokeLinecap="round" />
          <path d="M170 74v14" stroke="#334E68" strokeWidth="7" strokeLinecap="round" />
          <path d="M170 88h90" stroke="#334E68" strokeWidth="7" strokeLinecap="round" />
          <circle cx="130" cy="74" r="6" fill="#C2410C" />
          <circle cx="170" cy="80" r="5.5" fill="#EA580C" />
          <circle cx="220" cy="88" r="5" fill="#C2410C" />

          <g transform="translate(268 54)">
            <rect x="0" y="8" width="18" height="8" rx="2" fill="#0B2A4A" />
            <path d="M16 12h16a7 7 0 0 1 7 7" stroke="#0B2A4A" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M39 19v10" stroke="#7EC8E8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="39" cy="32" r="3" fill="#0B74DE" />
            <path d="M24 40h30l3 16H21Z" fill="#FFFFFF" stroke="#0B2A4A" strokeWidth="2" />
          </g>

          <rect x="0" y="96" width="680" height="26" fill={`url(#${soil})`} />
          <path d="M112 96v18" stroke="#334E68" strokeWidth="5" strokeLinecap="round" />
          <path d="M24 118h200" stroke="#0B74DE" strokeWidth="8" strokeLinecap="round" />
          <circle cx="196" cy="110" r="12" fill="#E7F6EE" />
          <path
            d="M190 110l4.5 4.5 8-9"
            fill="none"
            stroke="#157A45"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path d="M0 122h680v46H0Z" fill={`url(#${water})`} />
          <path
            d="M0 130c30 8 60-8 90 0s60 10 90 0 60-10 90 0 60 10 90 0 60-8 90 0 60 10 90 0 70-8 140 2v36H0Z"
            fill="#005EA8"
            opacity="0.35"
          />
        </svg>
        <figcaption className="pfas-path__caption">{LEAD_COPY.pathwayCaption}</figcaption>
      </figure>
    </section>
  )
}
