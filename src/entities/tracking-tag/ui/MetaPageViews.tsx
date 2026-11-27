'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

// Meta Pixel counts the first page view itself (its snippet); moving between pages in the browser does not
// reload it, so each later page is reported here. Google Analytics 4 counts them itself (enhanced
// measurement, on by default).
export function MetaPageViews() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.fbq?.('track', 'PageView')
  }, [pathname])

  return null
}
