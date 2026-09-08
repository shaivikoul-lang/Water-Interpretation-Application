import { ExternalLink } from 'lucide-react'
import type { AnalytePack, EduEntry, EducationPayload } from '../../types/water'

function defaultEntry(): EduEntry {
  return {
    tier: 'links_only',
    hook:
      'This measure is tracked under Colorado’s public drinking water rules. Official health information is on CDPHE and EPA pages.',
    links: [
      { label: 'CDPHE drinking water info', url: 'https://cdphe.colorado.gov/dwinfo' },
      {
        label: 'EPA drinking water rules',
        url: 'https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations',
      },
    ],
  }
}

function spikeYears(analyte: AnalytePack): number[] {
  const out: number[] = []
  for (const r of analyte.by_year) {
    const c = r.category ?? ''
    if (r.over_limit || c === 'Above Limit' || c === 'Approaching Limit') out.push(r.year)
  }
  return [...new Set(out)].sort((a, b) => a - b).slice(0, 6)
}

function shortLinkLabel(label: string): string {
  return label.replace(/\s*\(.*\)\s*$/, '').trim()
}

export function ChangedDetailNote({
  analyte,
  education,
}: {
  analyte: AnalytePack
  education: EducationPayload | null
}) {
  const entry = education?.by_analyte_name?.[analyte.analyte_name] ?? defaultEntry()
  const years = spikeYears(analyte)
  const links = entry.links.slice(0, 2)

  return (
    <aside className="changed-note">
      <div className="changed-note__top">
        <p className="changed-note__kicker">What this means</p>
        {years.length > 0 ? (
          <p className="changed-note__years">
            Closer to the limit in {years.join(', ')}
            {years.length >= 6 ? '…' : ''}
          </p>
        ) : null}
      </div>
      <p className="changed-note__hook">{entry.hook}</p>
      {links.length > 0 ? (
        <p className="changed-note__links">
          {links.map((link, i) => (
            <span key={link.url}>
              {i > 0 ? <span aria-hidden="true"> · </span> : null}
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {shortLinkLabel(link.label)}
                <ExternalLink className="changed-note__ext" aria-hidden />
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </aside>
  )
}
