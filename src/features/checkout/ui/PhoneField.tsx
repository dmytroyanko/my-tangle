'use client'

import { useId, useLayoutEffect, useRef } from 'react'

import { formatPhoneInput } from '../model/form'
import { FormField, inputA11y, inputBoxClassName } from './FormField'

type Props = {
  label: string
  placeholder: string
  // The number without +38, as formatPhoneInput gives it: "093 255 70 00".
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur?: () => void
}

// A Ukrainian phone: "+38" is a fixed label in front, the number is typed from 0 and grouped as it is typed.
// The caret stays after the same digit when the grouping changes, so editing in the middle works; a whole
// number pasted replaces the field.
export function PhoneField({ label, placeholder, value, error, onChange, onBlur }: Props) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  // Digits before the caret after the last edit, to put the caret back once the value is regrouped.
  const caretDigits = useRef<number | null>(null)

  useLayoutEffect(() => {
    const field = input.current
    const digits = caretDigits.current
    if (!field || digits === null || document.activeElement !== field) return
    caretDigits.current = null
    let position = 0
    for (let seen = 0; position < value.length && seen < digits; position++)
      if (/\d/.test(value[position])) seen++
    field.setSelectionRange(position, position)
  }, [value])

  const change = (raw: string, caret: number) => {
    const next = formatPhoneInput(raw)
    let digits = raw.slice(0, caret).replace(/\D/g, '').length
    // A 0 added in front of a number typed without it shifts the caret by one digit.
    if (next.startsWith('0') && !raw.replace(/\D/g, '').startsWith('0')) digits++
    caretDigits.current = digits
    onChange(next)
  }

  return (
    <FormField id={id} label={label} error={error}>
      <div className={inputBoxClassName(error)}>
        <span className="pl-3 text-base text-muted-foreground select-none" aria-hidden="true">
          +38
        </span>
        <input
          ref={input}
          {...inputA11y(id, error)}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            change(event.target.value, event.target.selectionStart ?? event.target.value.length)
          }
          onPaste={(event) => {
            const text = event.clipboardData.getData('text')
            // A whole number (9 digits or more) replaces what is there instead of being mixed into it.
            if (text.replace(/\D/g, '').length < 9) return
            event.preventDefault()
            const next = formatPhoneInput(text)
            caretDigits.current = next.replace(/\D/g, '').length
            onChange(next)
          }}
          onBlur={onBlur}
          className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent pr-3 pl-1.5 text-base outline-none"
        />
      </div>
    </FormField>
  )
}
