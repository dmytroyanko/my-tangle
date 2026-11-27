'use client'

import { ArrowUpIcon } from 'lucide-react'
import { useSyncExternalStore } from 'react'

// How far down (px) the page must be scrolled before the button appears: about one screen.
const THRESHOLD = 600

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  return () => window.removeEventListener('scroll', onChange)
}

// A round "back to top" button in the bottom right corner, shown once the page is scrolled down. Tablets and
// desktops only: on a phone it would cover the buy buttons in the corner. It scrolls smoothly unless the
// visitor asked the system for reduced motion.
export function ScrollToTop({ label }: { label: string }) {
  const visible = useSyncExternalStore(
    subscribe,
    () => window.scrollY > THRESHOLD,
    () => false,
  )
  if (!visible) return null

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }}
      className="fixed right-6 bottom-6 z-40 hidden size-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:flex"
    >
      <ArrowUpIcon className="size-5" aria-hidden="true" />
    </button>
  )
}
