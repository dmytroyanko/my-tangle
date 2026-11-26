import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

const box = 'h-11 rounded-lg border border-border bg-background'

// A text input of the checkout form; red border on an error.
export const inputClassName = (error?: string) =>
  cn(
    box,
    'w-full px-3 text-base outline-none focus-visible:border-foreground disabled:cursor-not-allowed disabled:bg-muted',
    error && 'border-destructive',
  )

// A box that looks like an input and holds one with something next to it (the "+38" of the phone field).
export const inputBoxClassName = (error?: string) =>
  cn(box, 'flex items-center focus-within:border-foreground', error && 'border-destructive')

// Attributes that tie an input to its label and error message.
export const inputA11y = (id: string, error?: string) => ({
  id,
  'aria-invalid': Boolean(error),
  'aria-describedby': error ? `${id}-error` : undefined,
})

// A labelled field of the checkout form with its error under it. The input inside takes inputA11y(id).
export function FormField({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
