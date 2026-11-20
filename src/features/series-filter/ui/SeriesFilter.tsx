'use client'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useId, useState, type ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

type Option = { value: string; label: string }

type Props = {
  options: Option[]
  // The filtered list, rendered on the server. Its items carry data-series="<value>".
  children: ReactNode
  className?: string
}

const PARAM = 'series'

// Multi-select filter by series. Every item stays in the HTML (for search engines); unselected ones are
// hidden with CSS. The selection is kept in the URL (?series=matte,chrome) without a navigation, so the
// link can be shared.
export function SeriesFilter({ options, children, className }: Props) {
  const t = useTranslations('SeriesFilter')
  const scope = useId()
  // Selection from a shared link. The page renders per request, so the server output is already filtered.
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<string[]>(() => {
    const values = searchParams.get(PARAM)?.split(',') ?? []
    return values.filter((value) => options.some((option) => option.value === value))
  })

  const update = (next: string[]) => {
    setSelected(next)
    const url = new URL(window.location.href)
    if (next.length) url.searchParams.set(PARAM, next.join(','))
    else url.searchParams.delete(PARAM)
    // Commas stay readable in the address bar (?series=matte,chrome).
    window.history.replaceState(window.history.state, '', url.href.replaceAll('%2C', ','))
  }

  const toggle = (value: string) =>
    update(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  const shown = selected.length || options.length
  const hideRule = selected.length
    ? `[data-filter-scope="${scope}"] [data-series]:not(${selected.map((v) => `[data-series="${v}"]`).join(',')}){display:none}`
    : ''

  const chip = (pressed: boolean) =>
    cn(
      'block rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
      pressed
        ? 'border-foreground bg-foreground text-background'
        : 'border-border hover:border-foreground',
    )

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={t('label')}
        className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
      >
        <ul className="flex gap-2 md:flex-wrap">
          <li className="shrink-0">
            <button
              type="button"
              aria-pressed={!selected.length}
              onClick={() => update([])}
              className={chip(!selected.length)}
            >
              {t('all')}
            </button>
          </li>
          {options.map((option) => (
            <li key={option.value} className="shrink-0">
              <button
                type="button"
                aria-pressed={selected.includes(option.value)}
                onClick={() => toggle(option.value)}
                className={chip(selected.includes(option.value))}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p role="status" className="sr-only">
        {t('shown', { count: shown, total: options.length })}
      </p>

      {hideRule && <style>{hideRule}</style>}
      <div data-filter-scope={scope}>{children}</div>
    </div>
  )
}
