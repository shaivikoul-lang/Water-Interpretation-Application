import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function PfasDialog({
  title,
  onClose,
  children,
  size = 'default',
}: {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'default' | 'wide'
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const prev = document.activeElement
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      )
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (prev instanceof HTMLElement) prev.focus()
    }
  }, [onClose])

  return (
    <div className="pfas-dialog">
      <button type="button" className="pfas-dialog__backdrop" aria-label="Close" onClick={onClose} />
      <div
        ref={panelRef}
        className={size === 'wide' ? 'pfas-dialog__panel pfas-dialog__panel--wide' : 'pfas-dialog__panel'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="pfas-dialog__bar">
          <h2 id={titleId} className="pfas-dialog__title">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="pfas-dialog__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="pfas-dialog__body">{children}</div>
      </div>
    </div>
  )
}
