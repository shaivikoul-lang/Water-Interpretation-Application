import { useId, useState } from 'react'
import { ResidentFeedback } from './ResidentFeedback'
import waterlensLogo from '../../assets/waterlens-logo.png'

type FooterPanel = 'sources' | 'method' | 'a11y' | 'feedback'

export function LandingFooter() {
  const [panel, setPanel] = useState<FooterPanel | null>(null)
  const sourcesId = useId()
  const methodId = useId()
  const a11yId = useId()
  const feedbackId = useId()

  function toggle(next: FooterPanel) {
    setPanel((open) => (open === next ? null : next))
  }

  return (
    <footer className="border-t border-[#d5e3f0] bg-white py-7">
      <div className="landing-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
          <span className="landing-brand">
            <img src={waterlensLogo} alt="WaterLens" className="landing-brand__logo" />
          </span>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
              <li>
                <button
                  type="button"
                  className="landing-footer__link"
                  aria-expanded={panel === 'sources'}
                  aria-controls={sourcesId}
                  onClick={() => toggle('sources')}
                >
                  Data Sources
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-footer__link"
                  aria-expanded={panel === 'method'}
                  aria-controls={methodId}
                  onClick={() => toggle('method')}
                >
                  Methodology
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-footer__link"
                  aria-expanded={panel === 'a11y'}
                  aria-controls={a11yId}
                  onClick={() => toggle('a11y')}
                >
                  Accessibility
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-footer__link"
                  aria-expanded={panel === 'feedback'}
                  aria-controls={feedbackId}
                  onClick={() => toggle('feedback')}
                >
                  Feedback
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div
          id={sourcesId}
          hidden={panel !== 'sources'}
          className="landing-footer-panel"
        >
          <h2>Data sources</h2>
          <p>
            WaterLens does not test tap water. Numbers on this site come from public
            monitoring already published by the water system and the state.
          </p>
          <ul>
            <li>
              <a
                className="landing-credit-link"
                href="https://cdphe.colorado.gov/dwinfo"
                target="_blank"
                rel="noreferrer"
              >
                CDPHE — Drinking Water Information
              </a>
              {' '}
              (public monitoring for Highlands Ranch Water, PWS CO0118015)
            </li>
            <li>
              <a
                className="landing-credit-link"
                href="https://www.highlandsranchwater.org/water-quality"
                target="_blank"
                rel="noreferrer"
              >
                Highlands Ranch Water — water quality reports
              </a>
              {' '}
              (consumer confidence reports, PFAS, lead and copper, and related tables)
            </li>
            <li>
              <a
                className="landing-credit-link"
                href="https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations"
                target="_blank"
                rel="noreferrer"
              >
                EPA — National Primary Drinking Water Regulations
              </a>
              {' '}
              (limits and health-context pages linked from each result)
            </li>
          </ul>
          <p>
            When a page uses a specific table or year, that source is named on the page.
          </p>
        </div>

        <div
          id={methodId}
          hidden={panel !== 'method'}
          className="landing-footer-panel"
        >
          <h2>Methodology</h2>
          <p>
            Design starts with the resident’s question — taste, a home reading, a named
            contaminant, or whether results have changed — then shows the matching official
            numbers in plain language. Utility name stays in the header so the page reads as
            an answer, not a chemistry report.
          </p>
          <p>
            Coding: this is a React and TypeScript app. Measurements are read from the
            published extract for this water system. Search is keyword matching, not an AI
            model, and the app does not invent, average-across-sources, or “interpret” a lab
            result that was not in the source file. Education copy is written by the project
            and linked back to CDPHE, EPA, and Highlands Ranch Water pages.
          </p>
          <p>
            WaterLens is an independent student-built tool. It is not a compliance
            determination and is not developed or maintained by Highlands Ranch Water or
            CDPHE.
          </p>
        </div>

        <div
          id={a11yId}
          hidden={panel !== 'a11y'}
          className="landing-footer-panel"
        >
          <h2>Accessibility</h2>
          <p>
            This page targets WCAG 2.2 Level AA. It uses semantic landmarks and headings, a
            skip link, native controls only, visible focus outlines, touch targets of at
            least 44&nbsp;pixels, and text contrast of at least 4.5:1. It carries no
            meaning by colour alone, works from 320&nbsp;pixels wide up to 200% zoom
            without horizontal scrolling, and honours the reduce-motion setting.
          </p>
          <p>
            Parts of the site outside this page have not been audited to the same standard
            yet. If something is hard to use, open Feedback in this footer and we will fix
            it.
          </p>
        </div>

        <div
          id={feedbackId}
          hidden={panel !== 'feedback'}
          className="landing-footer-panel landing-footer-panel--feedback"
        >
          <ResidentFeedback compact />
        </div>

        <p className="mt-5 border-t border-[#eef2f7] pt-4 text-[12px] leading-relaxed text-[#5b7590]">
          Header photograph: Chatfield State Park by{' '}
          <a
            className="landing-credit-link"
            href="https://commons.wikimedia.org/wiki/User:Denverjeffrey"
            target="_blank"
            rel="noreferrer"
          >
            Denverjeffrey
          </a>
          , cropped, via{' '}
          <a
            className="landing-credit-link"
            href="https://commons.wikimedia.org/wiki/File:Chatfield_State_Park.JPG"
            target="_blank"
            rel="noreferrer"
          >
            Wikimedia Commons
          </a>
          , licensed{' '}
          <a
            className="landing-credit-link"
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY-SA 4.0
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
