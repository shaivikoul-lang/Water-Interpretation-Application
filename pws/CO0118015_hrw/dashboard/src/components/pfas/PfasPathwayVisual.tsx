import { useId } from 'react'

function Molecule({
  x,
  y,
  fill,
  className,
}: {
  x: number
  y: number
  fill: string
  className?: string
}) {
  return (
    <g className={className}>
      <g transform={`translate(${x} ${y})`}>
        <circle cx="0" cy="0" r="4" fill={fill} />
        <circle cx="9" cy="3" r="3.2" fill={fill} opacity="0.85" />
        <circle cx="16" cy="-1" r="2.6" fill={fill} opacity="0.7" />
        <path
          d="M4 1 L6 2.2 M12 1.6 L13.6 0.4"
          stroke={fill}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

function ProductsMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <circle cx="30" cy="34" r="16" fill="#6B7C8F" />
      <circle cx="30" cy="34" r="11" fill="#334E68" />
      <circle cx="30" cy="34" r="7" fill="#EAF4FC" />
      <path d="M46 34h18" stroke="#0B2A4A" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 22 74 18l4 14-10 6-6-8Z" fill="#9B2C5D" />
      <path d="M66 24h8" stroke="#F8E8EF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FoamMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M10 40h28l-3-8H13Z" fill="#0B2A4A" />
      <path d="M38 36h16" stroke="#0B2A4A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="58" cy="22" r="9" fill="#FFFFFF" stroke="#D4E4F0" strokeWidth="1" />
      <circle cx="70" cy="18" r="7" fill="#F8E8EF" />
      <circle cx="66" cy="30" r="8" fill="#F4D0DC" />
      <circle cx="76" cy="28" r="5" fill="#FFFFFF" />
      <circle cx="54" cy="32" r="5" fill="#9B2C5D" opacity="0.4" />
    </svg>
  )
}

function IndustryMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M8 52V30l12-8 12 8v22H8Z" fill="#0B2A4A" />
      <rect x="44" y="28" width="28" height="24" fill="#334E68" />
      <path d="M22 10h8v16h-8Z" fill="#526D82" />
      <path d="M36 6h8v20h-8Z" fill="#526D82" />
      <rect x="14" y="36" width="7" height="7" fill="#EAF4FC" />
      <rect x="26" y="36" width="7" height="7" fill="#EAF4FC" />
      <rect x="50" y="34" width="7" height="7" fill="#EAF4FC" />
      <rect x="62" y="34" width="7" height="7" fill="#EAF4FC" />
      <path d="M26 4c5-5 11 0 8 8" stroke="#9B2C5D" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 2c5-5 11 0 8 8" stroke="#9B2C5D" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  )
}

function WasteMark() {
  return (
    <svg viewBox="0 0 88 64" className="pfas-path__ico" aria-hidden>
      <path d="M18 24h40l4 28H14Z" fill="#0B2A4A" />
      <path d="M16 24h44v6H16Z" fill="#334E68" />
      <path d="M28 16h20v8H28Z" fill="#526D82" />
      <rect x="24" y="34" width="10" height="8" fill="#EAF4FC" />
      <rect x="42" y="34" width="10" height="8" fill="#EAF4FC" />
      <circle cx="70" cy="40" r="8" fill="#9B2C5D" opacity="0.55" />
      <path d="M68 12c1 8 0 14-2 20" stroke="#0B74DE" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const SOURCES = [
  { label: 'Everyday products', Mark: ProductsMark },
  { label: 'Firefighting foam', Mark: FoamMark },
  { label: 'Industry', Mark: IndustryMark },
  { label: 'Waste', Mark: WasteMark },
] as const

export function PfasPathwayVisual() {
  const uid = useId()
  const headingId = `${uid}-h`
  const sky = `${uid}-sky`
  const water = `${uid}-water`
  const soil = `${uid}-soil`

  return (
    <section className="pfas-path" aria-labelledby={headingId}>
      <h2 id={headingId} className="pfas-path__h">
        How PFAS can reach water
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
          aria-label="PFAS from products, firefighting foam, industry, and waste can move through soil, groundwater, and rivers into drinking-water sources."
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

          <path d="M0 58h680" stroke="#9B2C5D" strokeWidth="1.5" strokeDasharray="3 7" opacity="0.35" />
          <Molecule x={70} y={18} fill="#9B2C5D" className="pfas-mol-drift" />
          <Molecule x={210} y={10} fill="#9B2C5D" className="pfas-mol-drift" />
          <Molecule x={350} y={20} fill="#9B2C5D" className="pfas-mol-drift" />
          <Molecule x={490} y={12} fill="#9B2C5D" className="pfas-mol-drift" />
          <Molecule x={160} y={36} fill="#C45A86" className="pfas-mol-drift" />
          <Molecule x={400} y={40} fill="#C45A86" className="pfas-mol-drift" />

          <path d="M0 70c40-10 80 8 120 0s80-12 130 2 90 8 140-6 110 4 150 0 90-8 140 6v28H0Z" fill="#7A9A5C" />
          <path d="M48 70v-16h22v16" fill="#0B2A4A" />
          <path d="M44 54h30l-15-12Z" fill="#9B2C5D" />
          <circle cx="200" cy="62" r="10" fill="#3F7A3A" />
          <circle cx="214" cy="60" r="8" fill="#5A9A4E" />
          <rect x="0" y="92" width="680" height="28" fill={`url(#${soil})`} />
          <Molecule x={120} y={100} fill="#9B2C5D" className="pfas-mol-drift" />
          <Molecule x={300} y={104} fill="#9B2C5D" className="pfas-mol-drift" />
          <Molecule x={460} y={98} fill="#C45A86" className="pfas-mol-drift" />

          <path d="M0 120h680v48H0Z" fill={`url(#${water})`} />
          <path
            d="M0 128c30 8 60-8 90 0s60 10 90 0 60-10 90 0 60 10 90 0 60-8 90 0 60 10 90 0 70-8 140 2v38H0Z"
            fill="#005EA8"
            opacity="0.35"
          />
          <Molecule x={90} y={136} fill="#F8E8EF" />
          <Molecule x={250} y={142} fill="#FFFFFF" />
          <Molecule x={410} y={134} fill="#F8E8EF" />

          <g transform="translate(548 70)">
            <path d="M36 6h28v10H36Z" fill="#0B2A4A" />
            <path d="M58 16v10" stroke="#0B2A4A" strokeWidth="6" strokeLinecap="round" />
            <path d="M58 26h18" stroke="#0B2A4A" strokeWidth="6" strokeLinecap="round" />
            <path d="M76 26v12" stroke="#7EC8E8" strokeWidth="4" strokeLinecap="round" />
            <path d="M66 48h24l3 22H63Z" fill="#FFFFFF" stroke="#0B2A4A" strokeWidth="2.2" />
            <path d="M66 62h24" fill="none" stroke="#0B74DE" strokeWidth="10" opacity="0.35" />
          </g>
        </svg>
        <figcaption className="pfas-path__caption">
          Finding PFAS in water does not, by itself, tell us where it came from.
        </figcaption>
      </figure>
    </section>
  )
}
