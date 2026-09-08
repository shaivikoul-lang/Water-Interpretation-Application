import { useEffect, useId, useRef, useState } from 'react'
import { MapPin, Menu, Search, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import {
  MY_WATER_PENDING_MESSAGE,
  resolveSearchIntent,
  searchHrefForIntent,
  type LandingIntent,
} from '../../lib/landingIntents'
import waterlensLogo from '../../assets/waterlens-logo.png'

type NavItem = {
  label: string
  href?: string
  current?: boolean
  action?: 'home' | 'about'
  /** Items with no destination yet announce a short status instead of navigating. */
  pending?: string
}

function navItems(activePage: 'home' | 'about'): NavItem[] {
  return [
    { label: 'Home', href: './', current: activePage === 'home', action: 'home' },
    { label: 'My Water', pending: MY_WATER_PENDING_MESSAGE },
    { label: 'About', href: '?about=1', current: activePage === 'about', action: 'about' },
  ]
}

export function LandingHeader({
  utilityLabel,
  activePage = 'home',
  onHome,
  onAbout,
  onIntent,
}: {
  utilityLabel: string
  activePage?: 'home' | 'about'
  onHome?: () => void
  onAbout?: () => void
  onIntent?: (intent: LandingIntent) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const menuId = useId()
  const searchId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const items = navItems(activePage)

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const intent = resolveSearchIntent(query)
    if (!intent || intent.kind === 'pending') {
      setNotice(
        intent?.kind === 'pending'
          ? intent.message
          : 'No match in WaterLens. Try PFAS, TDS, lead, chlorine, or metallic taste.',
      )
      return
    }
    setNotice(null)
    setQuery('')
    if (onIntent) {
      onIntent(intent)
      return
    }
    const href = searchHrefForIntent(intent)
    if (href) window.location.assign(href)
  }

  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  function renderNavItem(item: NavItem, onNavigate?: () => void) {
    if (item.pending) {
      return (
        <button
          type="button"
          className="landing-nav__link"
          onClick={() => {
            setNotice(item.pending!)
            onNavigate?.()
          }}
        >
          {item.label}
        </button>
      )
    }
    return (
      <a
        href={item.href}
        aria-current={item.current ? 'page' : undefined}
        onClick={(event) => {
          if (item.action === 'home' && onHome) {
            event.preventDefault()
            onHome()
            onNavigate?.()
            return
          }
          if (item.action === 'about' && onAbout) {
            event.preventDefault()
            onAbout()
            onNavigate?.()
            return
          }
          onNavigate?.()
        }}
        className="landing-nav__link"
      >
        {item.label}
      </a>
    )
  }

  return (
    <header className="border-b border-[#d5e3f0] bg-white">
      <div className="landing-container landing-header-bar">
        <a
          href="./"
          className="landing-brand"
          onClick={(event) => {
            if (!onHome) return
            event.preventDefault()
            onHome()
          }}
        >
          <img src={waterlensLogo} alt="WaterLens" className="landing-brand__logo" />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {items.map((item) => (
              <li key={item.label}>{renderNavItem(item)}</li>
            ))}
          </ul>
        </nav>
        <p className="landing-mission">
          <strong>We are WaterLens.</strong>
          {' '}
          Helping residents understand their tap water through official data and plain language.
        </p>

        <div className="landing-header-end">
          <form onSubmit={handleSearch} className="landing-header-search" role="search">
            <label htmlFor={searchId} className="sr-only">
              Search WaterLens
            </label>
            <Search className="landing-header-search__icon" aria-hidden />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="landing-header-search__input"
            />
            <button type="submit" className="landing-header-search__go">
              Search
            </button>
          </form>

          <p className="landing-header-utility">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {utilityLabel}
          </p>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-[#8fb8d8] px-3 text-[15px] font-semibold text-[#0b2545] transition-colors hover:bg-[#e6f1fb] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#00457c] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            Menu
          </button>
        </div>
      </div>

      <nav
        id={menuId}
        aria-label="Main"
        hidden={!menuOpen}
        className={cn('border-t border-[#d5e3f0] bg-white lg:hidden')}
      >
        <ul className="landing-container flex flex-col py-2">
          {items.map((item) => (
            <li key={item.label} className="[&>*]:w-full">
              {renderNavItem(item, () => setMenuOpen(false))}
            </li>
          ))}
          <li className="landing-mission landing-mission--menu">
            <strong>We are WaterLens.</strong>
            {' '}
            Helping residents understand their tap water through official data and plain language.
          </li>
          <li className="flex items-center gap-1.5 border-t border-[#e2e8f0] px-3 pb-1 pt-3 text-[14px] font-semibold text-[#00457c] sm:hidden">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {utilityLabel}
          </li>
        </ul>
      </nav>

      <div role="status" className="landing-container">
        {notice && (
          <p className="mb-2 rounded-lg border border-[#00457c] bg-[#e6f1fb] px-3 py-2 text-[14px] font-medium text-[#0b2545]">
            {notice}
          </p>
        )}
      </div>
    </header>
  )
}
