import { useId } from 'react'

/**
 * Landing-page icons drawn to match the WaterLens design comp.
 *
 * lucide's uniform outline set can't express the comp's filled/duotone look, so
 * these are hand-authored. Gradient ids come from `useId` because several of
 * these render more than once per page and duplicate ids would cross-reference.
 *
 * All are decorative: the adjacent text carries the meaning, so callers get
 * `aria-hidden` by default.
 */

type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true,
  focusable: false,
} as const

/** Brand mark: filled droplet with a specular highlight. */
export function WaterLensLogo({ className }: IconProps) {
  const id = useId()
  return (
    <svg {...base} className={className}>
      <defs>
        <linearGradient id={`${id}-d`} x1="6" y1="3" x2="18" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8ad4f7" />
          <stop offset="0.45" stopColor="#2b8fdb" />
          <stop offset="1" stopColor="#0a5aa0" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.2c0 0-7.1 7.9-7.1 12.6a7.1 7.1 0 0 0 14.2 0C19.1 10.1 12 2.2 12 2.2Z"
        fill={`url(#${id}-d)`}
      />
      <ellipse cx="9.5" cy="12.4" rx="1.7" ry="2.6" fill="#ffffff" opacity="0.5" transform="rotate(-18 9.5 12.4)" />
    </svg>
  )
}

/** Card 1 — taste / smell / appearance. */
export function DropletCardIcon({ className }: IconProps) {
  const id = useId()
  return (
    <svg {...base} className={className}>
      <defs>
        <linearGradient id={`${id}-d`} x1="6" y1="3" x2="18" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9bdbf9" />
          <stop offset="0.5" stopColor="#2f92dd" />
          <stop offset="1" stopColor="#0b5ea6" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.9c0 0-7.4 8.2-7.4 13.1a7.4 7.4 0 0 0 14.8 0C19.4 10.1 12 1.9 12 1.9Z"
        fill={`url(#${id}-d)`}
      />
      <ellipse cx="9.2" cy="12.6" rx="1.8" ry="2.8" fill="#ffffff" opacity="0.52" transform="rotate(-18 9.2 12.6)" />
    </svg>
  )
}

/** Card 2 — home meter or test reading. */
export function TestTubeCardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      {/* liquid sits behind the outline so the stroke stays crisp */}
      <path d="M9 11.5h6v4.2a3 3 0 0 1-6 0Z" fill="#14b8a6" />
      <path
        d="M9 3.2v12.5a3 3 0 0 0 6 0V3.2"
        stroke="#0f766e"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M7.6 3.2h8.8" stroke="#0f766e" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="13.6" r="0.85" fill="#ccfbf1" />
      <circle cx="10.6" cy="16.1" r="0.6" fill="#ccfbf1" />
    </svg>
  )
}

/** Card 3 — worried about a contaminant. */
export function FlaskCardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M7.35 14.6 5.1 18.7a1.5 1.5 0 0 0 1.32 2.2h11.16a1.5 1.5 0 0 0 1.32-2.2l-2.25-4.1Z"
        fill="#c026d3"
      />
      <path
        d="M10.1 3v5.4L5.1 18.7a1.5 1.5 0 0 0 1.32 2.2h11.16a1.5 1.5 0 0 0 1.32-2.2L13.9 8.4V3"
        stroke="#86198f"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.1 3h5.8" stroke="#86198f" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="18" r="0.85" fill="#fae8ff" />
    </svg>
  )
}

/** Card 4 — has my water changed. */
export function BarGraphCardIcon({ className }: IconProps) {
  const id = useId()
  return (
    <svg {...base} className={className}>
      <defs>
        <linearGradient id={`${id}-b`} x1="12" y1="4" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect x="3.1" y="13.4" width="3.5" height="7.5" rx="1.1" fill={`url(#${id}-b)`} />
      <rect x="8.2" y="9.4" width="3.5" height="11.5" rx="1.1" fill={`url(#${id}-b)`} />
      <rect x="13.3" y="5.1" width="3.5" height="15.8" rx="1.1" fill={`url(#${id}-b)`} />
      <rect x="18.4" y="11.2" width="3.5" height="9.7" rx="1.1" fill={`url(#${id}-b)`} />
    </svg>
  )
}

/** Card 5 — show me my water. Deliberately not another droplet silhouette. */
export function LensCardIcon({ className }: IconProps) {
  const id = useId()
  return (
    <svg {...base} className={className}>
      <defs>
        <linearGradient id={`${id}-d`} x1="7" y1="6" x2="14" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#2f92dd" />
        </linearGradient>
      </defs>
      <circle cx="10.4" cy="10.4" r="7.1" fill="#eef2ff" />
      <path
        d="M10.4 5.6c0 0-3.1 3.5-3.1 5.5a3.1 3.1 0 0 0 6.2 0c0-2-3.1-5.5-3.1-5.5Z"
        fill={`url(#${id}-d)`}
      />
      <circle cx="10.4" cy="10.4" r="7.1" stroke="#4f46e5" strokeWidth="1.8" />
      <path
        d="m15.7 15.7 4.6 4.6"
        stroke="#4f46e5"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Community card — residents / outreach. */
export function CommunityIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8.4" cy="7.6" r="3.1" fill="#047857" />
      <circle cx="16.2" cy="8.6" r="2.5" fill="#10b981" />
      <path
        d="M2.6 19.4c0-3.2 2.6-5.8 5.8-5.8s5.8 2.6 5.8 5.8Z"
        fill="#047857"
      />
      <path
        d="M15 14.1c2.7 0 4.9 2.2 4.9 4.9h-3.6"
        fill="#10b981"
      />
    </svg>
  )
}
