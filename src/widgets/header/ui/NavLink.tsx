'use client'

import type { ComponentProps } from 'react'

import { Link, usePathname } from '@/shared/i18n'

// Link that marks itself as the current page for styling (aria-current) and screen readers.
export function NavLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return <Link href={href} aria-current={active ? 'page' : undefined} {...props} />
}
