'use client'

import { useEffect, useId, useState } from 'react'

import { cn } from '@/shared/lib/utils'

import type { NpOption } from '../api/novaPoshta'
import { FormField, inputA11y, inputClassName } from './FormField'

type Props = {
  label: string
  placeholder: string
  // The picked option's name, shown in the field.
  value: string
  disabled?: boolean
  error?: string
  emptyText: string
  loadingText: string
  // Searches as the visitor types; called with an empty query when the field opens (branches of a city).
  search: (query: string) => Promise<NpOption[]>
  minQuery?: number
  onSelect: (option: NpOption | null) => void
}

// A text field with a list of matches (combobox): type, then pick with the mouse or the arrow keys and
// Enter. Typing again clears the pick, so a name that is not from the list is never submitted.
export function SearchSelect({
  label,
  placeholder,
  value,
  disabled,
  error,
  emptyText,
  loadingText,
  search,
  minQuery = 0,
  onSelect,
}: Props) {
  const id = useId()
  const [query, setQuery] = useState(value)
  // The field follows a pick made from outside (cleared when the city changes).
  const [shown, setShown] = useState(value)
  if (value !== shown) {
    setShown(value)
    setQuery(value)
  }
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  // The last answer and the query it is for: while it is for another query, the search is running.
  const [result, setResult] = useState<{ query: string; options: NpOption[] } | null>(null)
  const searchable = open && query.trim().length >= minQuery
  const options = result?.query === query ? result.options : []
  const loading = searchable && result?.query !== query

  useEffect(() => {
    if (!searchable) return
    let cancelled = false
    const timer = setTimeout(() => {
      search(query)
        .catch(() => [])
        .then((found) => {
          if (cancelled) return
          setResult({ query, options: found })
          setActive(found.length ? 0 : -1)
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchable, query, search])

  const pick = (option: NpOption) => {
    onSelect(option)
    setQuery(option.name)
    setOpen(false)
  }

  const listId = `${id}-list`
  const showList = searchable

  return (
    <FormField id={id} label={label} error={error} className="relative">
      <input
        {...inputA11y(id, error)}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${id}-${active}` : undefined}
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          if (value) onSelect(null)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActive((index) => Math.min(index + 1, options.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) => Math.max(index - 1, 0))
          } else if (event.key === 'Enter' && showList && options[active]) {
            event.preventDefault()
            pick(options[active])
          } else if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
        className={inputClassName(error)}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-background py-1 shadow-lg"
        >
          {loading && options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{loadingText}</li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.ref}
                id={`${id}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault()
                  pick(option)
                }}
                onMouseEnter={() => setActive(index)}
                className={cn('cursor-pointer px-3 py-2 text-sm', index === active && 'bg-muted')}
              >
                {option.name}
              </li>
            ))
          )}
        </ul>
      )}
    </FormField>
  )
}
