import { useId } from 'react'

function ProductsIcon() {
  return (
    <svg viewBox="0 0 32 32" className="pfas-path__ico" aria-hidden>
      <circle cx="10" cy="20" r="6.2" fill="none" stroke="#0B2A4A" strokeWidth="2.3" />
      <path d="M16.2 20h7.6" stroke="#0B2A4A" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M20 7.2 25.2 5.4 28.2 9.2v11.4L24.6 22.6 20 19.2Z"
        fill="#0B74DE"
      />
      <path d="M24.2 7.6v12.4" stroke="#EAF4FC" strokeWidth="1.2" />
    </svg>
  )
}

function FoamIcon() {
  return (
    <svg viewBox="0 0 32 32" className="pfas-path__ico" aria-hidden>
      <path
        d="M5 23c1-8 6.5-13 13-13 3.2 0 4.6 2 7.2 2 4 0 6.4 3 6.4 6.4"
        fill="none"
        stroke="#0B2A4A"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M5.2 23h9.2l-1.6-3.6H6.6Z" fill="#0B2A4A" />
      <circle cx="23.5" cy="9.4" r="3.4" fill="#0B74DE" />
      <circle cx="28" cy="13.2" r="2.5" fill="#0B74DE" opacity="0.55" />
      <circle cx="20.2" cy="8" r="2" fill="#0B74DE" opacity="0.45" />
    </svg>
  )
}

function IndustryIcon() {
  return (
    <svg viewBox="0 0 32 32" className="pfas-path__ico" aria-hidden>
      <path d="M4 27V15.2L11 10l7 5.2V27H4Z" fill="#0B2A4A" />
      <path d="M18 27V13h11v14H18Z" fill="#0B2A4A" />
      <rect x="7.2" y="19" width="3.6" height="3.6" fill="#EAF4FC" />
      <rect x="12.2" y="19" width="3.6" height="3.6" fill="#EAF4FC" />
      <rect x="20.4" y="17.2" width="3.6" height="3.6" fill="#EAF4FC" />
      <rect x="25" y="17.2" width="3.6" height="3.6" fill="#EAF4FC" />
      <path d="M21.2 6h3.2v7h-3.2Z" fill="#0B74DE" />
      <path d="M25.6 4h3.2v9h-3.2Z" fill="#0B74DE" />
    </svg>
  )
}

function WasteIcon() {
  return (
    <svg viewBox="0 0 32 32" className="pfas-path__ico" aria-hidden>
      <path d="M7 12.5h18l1.8 14.2H5.2Z" fill="#0B2A4A" />
      <path d="M6 12.5h20v3.6H6Z" fill="#334E68" />
      <path d="M12 7.4h8v5.1h-8Z" fill="#0B74DE" />
      <rect x="10.4" y="18.6" width="4.4" height="3.8" fill="#EAF4FC" />
      <rect x="17.2" y="18.6" width="4.4" height="3.8" fill="#EAF4FC" />
    </svg>
  )
}

const SOURCES = [
  { label: 'Everyday products', Icon: ProductsIcon },
  { label: 'Firefighting foam', Icon: FoamIcon },
  { label: 'Industry', Icon: IndustryIcon },
  { label: 'Waste', Icon: WasteIcon },
] as const

function Molecule() {
  return (
    <g>
      <circle cx="0" cy="0" r="3.1" fill="#9B2C5D" />
      <path d="M3.1 0h5.4" stroke="#9B2C5D" strokeWidth="1.6" />
      <circle cx="11.4" cy="0" r="3.1" fill="#9B2C5D" />
      <path d="M14.5 0h5.4" stroke="#9B2C5D" strokeWidth="1.6" />
      <circle cx="22.8" cy="0" r="3.1" fill="#9B2C5D" />
    </g>
  )
}

function CanArrow({ direction }: { direction: 'across' | 'down' }) {
  return (
    <p className={`pfas-path__can pfas-path__can--${direction}`} aria-hidden>
      <span>can</span>
      {direction === 'across' ? (
        <svg viewBox="0 0 28 12" className="pfas-path__can-svg">
          <path
            d="M1 6h20M17 2l6 4-6 4"
            fill="none"
            stroke="#0B2A4A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 12 28" className="pfas-path__can-svg pfas-path__can-svg--down">
          <path
            d="M6 1v20M2 17l4 6 4-6"
            fill="none"
            stroke="#0B2A4A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </p>
  )
}

function MoveThroughScene({ uid }: { uid: string }) {
  const soil = `${uid}-soil`
  const water = `${uid}-water`

  return (
    <svg
      className="pfas-path__scene"
      viewBox="0 0 300 210"
      role="img"
      aria-label="PFAS can move downward through rain, soil, and water. Finding PFAS in water does not, by itself, tell us where it came from."
    >
      <defs>
        <linearGradient id={soil} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E4D4B0" />
          <stop offset="1" stopColor="#C8B48A" />
        </linearGradient>
        <linearGradient id={water} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FD0EC" />
          <stop offset="1" stopColor="#0B74DE" />
        </linearGradient>
      </defs>

      <rect width="300" height="210" rx="12" fill="#F7FAFC" />
      <path d="M0 88c40-14 80 8 120 0s78-16 128 2 70 8 52-2v36H0Z" fill="#8FB56E" />
      <rect x="0" y="118" width="300" height="36" fill={`url(#${soil})`} />
      <rect x="0" y="154" width="300" height="56" fill={`url(#${water})`} />

      <text x="150" y="22" textAnchor="middle" className="pfas-path__svg-label">
        Rain
      </text>
      <path
        d="M58 30c0 3-2.4 6-4 6s-4-3-4-6 2.2-5.4 4-5.4 4 2.4 4 5.4Z"
        fill="#0B74DE"
        opacity="0.55"
      />
      <path
        d="M150 28c0 3-2.4 6-4 6s-4-3-4-6 2.2-5.4 4-5.4 4 2.4 4 5.4Z"
        fill="#0B74DE"
        opacity="0.55"
      />
      <path
        d="M242 30c0 3-2.4 6-4 6s-4-3-4-6 2.2-5.4 4-5.4 4 2.4 4 5.4Z"
        fill="#0B74DE"
        opacity="0.55"
      />

      <path d="M54 48v118" className="pfas-path__fall-line" />
      <path d="M146 44v122" className="pfas-path__fall-line" />
      <path d="M238 48v118" className="pfas-path__fall-line" />
      <path d="M50 166l4 8 4-8" fill="none" stroke="#9B2C5D" strokeWidth="1.8" />
      <path d="M142 166l4 8 4-8" fill="none" stroke="#9B2C5D" strokeWidth="1.8" />
      <path d="M234 166l4 8 4-8" fill="none" stroke="#9B2C5D" strokeWidth="1.8" />

      <g transform="translate(42 40)">
        <g className="pfas-mol-fall pfas-mol-fall--a">
          <Molecule />
        </g>
      </g>
      <g transform="translate(134 36)">
        <g className="pfas-mol-fall pfas-mol-fall--b">
          <Molecule />
        </g>
      </g>
      <g transform="translate(226 40)">
        <g className="pfas-mol-fall pfas-mol-fall--c">
          <Molecule />
        </g>
      </g>

      <text x="150" y="141" textAnchor="middle" className="pfas-path__svg-label">
        Soil
      </text>
      <text x="150" y="188" textAnchor="middle" className="pfas-path__svg-label pfas-path__svg-label--on-blue">
        Water
      </text>
    </svg>
  )
}

function TapScene() {
  return (
    <svg
      className="pfas-path__tap"
      viewBox="0 0 140 210"
      role="img"
      aria-label="PFAS can reach a drinking-water tap."
    >
      <rect x="48" y="16" width="28" height="12" rx="3" fill="#0B2A4A" />
      <path d="M62 28v16" stroke="#0B2A4A" strokeWidth="10" strokeLinecap="round" />
      <path
        d="M62 44h34c10 0 14 6 14 14"
        fill="none"
        stroke="#0B2A4A"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M110 58v28"
        stroke="#0B74DE"
        strokeWidth="5"
        strokeLinecap="round"
        className="pfas-path__stream"
      />
      <path
        d="M86 98h48l-5 62H91Z"
        fill="#FFFFFF"
        stroke="#0B2A4A"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M90 136h40" stroke="#0B74DE" strokeWidth="22" opacity="0.32" />
    </svg>
  )
}

export function PfasPathwayVisual() {
  const uid = useId()
  const headingId = `${uid}-h`

  return (
    <section className="pfas-path pfas-path--zones" aria-labelledby={headingId}>
      <h2 id={headingId} className="pfas-path__h">
        How PFAS can reach water
      </h2>

      <figure className="pfas-path__figure">
        <div className="pfas-path__board">
          <div className="pfas-path__zone">
            <p className="pfas-path__zone-label">Can come from</p>
            <ul className="pfas-path__sources">
              {SOURCES.map(({ label, Icon }) => (
                <li key={label} className="pfas-path__source">
                  <span className="pfas-path__ico-wrap">
                    <Icon />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <CanArrow direction="across" />
          <CanArrow direction="down" />

          <div className="pfas-path__zone">
            <p className="pfas-path__zone-label">Can move through</p>
            <MoveThroughScene uid={uid} />
          </div>

          <CanArrow direction="across" />
          <CanArrow direction="down" />

          <div className="pfas-path__zone pfas-path__zone--tap">
            <p className="pfas-path__zone-label">Can reach a tap</p>
            <TapScene />
          </div>
        </div>

        <figcaption className="pfas-path__caption">
          Finding PFAS in water does not, by itself, tell us where it came from.
        </figcaption>
      </figure>
    </section>
  )
}
