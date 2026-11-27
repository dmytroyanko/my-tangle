'use client'

import { CheckCircle2Icon } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useId, useState, type ReactNode } from 'react'

import {
  cartActions,
  cartTotals,
  CartTotals,
  LinePrice,
  useCart,
  useRefreshCart,
  type CartLine,
} from '@/entities/cart/index.client'
import type { PaymentMethodData } from '@/entities/payment-method'
import { Link } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

import { searchCities, searchWarehouses } from '../api/novaPoshta'
import { placeOrder } from '../api/placeOrder'
import {
  normalizePhone,
  validateCheckout,
  type CheckoutError,
  type CheckoutField,
  type CheckoutForm as Form,
} from '../model/form'
import { FormField, inputA11y, inputClassName } from './FormField'
import { PhoneField } from './PhoneField'
import { SearchSelect } from './SearchSelect'

const EMPTY_FORM: Form = {
  lastName: '',
  firstName: '',
  phone: '',
  email: '',
  city: '',
  cityRef: '',
  warehouse: '',
  warehouseRef: '',
  payment: null,
  comment: '',
}

type Errors = Partial<Record<CheckoutField, CheckoutError>>

// The checkout: contacts, a Nova Poshta branch picked from its directory, payment and a comment, next to the
// order summary. The cart is checked on the server when the page opens and again when the order is placed;
// if anything changed meanwhile, the visitor sees the updated summary and confirms again.
type Props = {
  bundlePercent: number | null
  // Paths of the offer and the privacy policy for the consent line; a missing one is shown as text.
  legalLinks: { offer?: string; privacy?: string }
  // The payment methods switched on in the admin; the first one is picked by default.
  payments: PaymentMethodData[]
}

export function CheckoutForm({ bundlePercent, legalLinks, payments }: Props) {
  const t = useTranslations('Checkout')
  const locale = useLocale()
  const { lines, ready } = useCart()
  const refresh = useRefreshCart(true, locale)
  const [form, setForm] = useState<Form>(() => ({
    ...EMPTY_FORM,
    payment: payments[0]?.id ?? null,
  }))
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState<'cartChanged' | 'failed' | null>(null)
  const [pending, setPending] = useState(false)
  // The placed order as the visitor saw it, for the thank-you screen (the cart is emptied by then).
  const [placed, setPlaced] = useState<{
    id: number
    lines: CartLine[]
    form: Pick<Form, 'city' | 'warehouse'>
    payment?: PaymentMethodData
  } | null>(null)
  // A field for bots only: hidden from people and screen readers, filled in by naive spam scripts.
  const [website, setWebsite] = useState('')

  const inStock = lines.filter((line) => line.view.inStock)
  const totals = cartTotals(lines, bundlePercent)

  const update = (patch: Partial<Form>) => {
    setForm((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch) as CheckoutField[]) delete next[key]
      if ('cityRef' in patch) delete next.city
      if ('warehouseRef' in patch) delete next.warehouse
      return next
    })
  }

  const findCities = useCallback((query: string) => searchCities(query), [])
  const findWarehouses = useCallback(
    (query: string) => searchWarehouses(form.cityRef, query, locale),
    [form.cityRef, locale],
  )

  if (placed)
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2Icon className="size-12 text-foreground" aria-hidden="true" />
        <h1>{t('thanksTitle')}</h1>
        <p className="text-lg font-semibold">{t('thanksNumber', { number: placed.id })}</p>
        <p className="text-base text-muted-foreground">{t('thanksText')}</p>
        <section className="mt-2 w-full rounded-xl bg-muted p-5 text-left">
          <h2 className="mb-1 text-lg">{t('summary')}</h2>
          <OrderLines
            lines={placed.lines}
            totals={cartTotals(placed.lines, bundlePercent)}
            bundlePercent={bundlePercent}
          />
          <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
            <div>
              <dt className="font-semibold">{t('delivery')}</dt>
              <dd className="text-muted-foreground">
                {placed.form.city}, {placed.form.warehouse}
              </dd>
            </div>
            {placed.payment && (
              <div>
                <dt className="font-semibold">
                  {t('payment')}: {placed.payment.title}
                </dt>
                {placed.payment.note && (
                  <dd className="text-muted-foreground">{placed.payment.note}</dd>
                )}
              </div>
            )}
          </dl>
        </section>
        <Button asChild className="mt-2 rounded-full px-6">
          <Link href="/">{t('thanksHome')}</Link>
        </Button>
      </div>
    )

  if (!ready) return <h1 className="py-8">{t('title')}</h1>

  if (inStock.length === 0)
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <h1>{t('title')}</h1>
        <p className="text-base text-muted-foreground">{t('empty')}</p>
        <Button asChild className="rounded-full px-6">
          <Link href="/#catalog">{t('toCatalog')}</Link>
        </Button>
      </div>
    )

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setNotice(null)
    const found = validateCheckout(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setPending(true)
    try {
      const result = await placeOrder({
        form,
        items: inStock.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          price: line.view.price,
        })),
        locale,
        website,
      })
      if (result.ok) {
        cartActions.clear()
        setPlaced({
          id: result.orderId,
          lines: inStock,
          form: { city: form.city, warehouse: form.warehouse },
          payment: payments.find((method) => method.id === form.payment),
        })
        window.scrollTo({ top: 0 })
      } else if (result.reason === 'invalid') {
        setErrors(result.errors)
      } else if (result.reason === 'failed') {
        setNotice('failed')
      } else {
        await refresh().catch(() => {})
        setNotice('cartChanged')
      }
    } catch {
      setNotice('failed')
    } finally {
      setPending(false)
    }
  }

  const error = (field: CheckoutField) => (errors[field] ? t(`errors.${errors[field]}`) : undefined)

  return (
    <form onSubmit={submit} noValidate className="py-6">
      <h1 className="mb-6">{t('title')}</h1>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex flex-col gap-8">
          <Section title={t('contacts')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t('lastName')}
                autoComplete="family-name"
                value={form.lastName}
                error={error('lastName')}
                onChange={(lastName) => update({ lastName })}
              />
              <Field
                label={t('firstName')}
                autoComplete="given-name"
                value={form.firstName}
                error={error('firstName')}
                onChange={(firstName) => update({ firstName })}
              />
              <PhoneField
                label={t('phone')}
                placeholder={t('phonePlaceholder')}
                value={form.phone}
                error={error('phone')}
                onChange={(phone) => update({ phone })}
                // An unfinished number is pointed out on leaving the field, not only on submit.
                onBlur={() => {
                  if (form.phone && !normalizePhone(form.phone))
                    setErrors((current) => ({ ...current, phone: 'phone' }))
                }}
              />
              <Field
                label={`${t('email')} (${t('optional')})`}
                type="email"
                autoComplete="email"
                value={form.email}
                error={error('email')}
                onChange={(email) => update({ email })}
              />
            </div>
          </Section>

          <Section title={t('delivery')}>
            <div className="grid gap-4">
              <SearchSelect
                label={t('city')}
                placeholder={t('cityPlaceholder')}
                value={form.city}
                minQuery={2}
                search={findCities}
                loadingText={t('searching')}
                emptyText={t('noCities')}
                error={error('city')}
                onSelect={(option) =>
                  update({
                    city: option?.name ?? '',
                    cityRef: option?.ref ?? '',
                    warehouse: '',
                    warehouseRef: '',
                  })
                }
              />
              <SearchSelect
                // A new list for every city, so the branches of the previous one never show.
                key={form.cityRef}
                label={t('warehouse')}
                placeholder={form.cityRef ? t('warehousePlaceholder') : t('warehouseDisabled')}
                value={form.warehouse}
                disabled={!form.cityRef}
                search={findWarehouses}
                loadingText={t('searching')}
                emptyText={t('noWarehouses')}
                error={error('warehouse')}
                onSelect={(option) =>
                  update({ warehouse: option?.name ?? '', warehouseRef: option?.ref ?? '' })
                }
              />
              <p className="text-sm text-muted-foreground">{t('deliveryNote')}</p>
            </div>
          </Section>

          <Section title={t('payment')}>
            {/* Every method switched off in the admin: orders cannot be placed, the phones still work. */}
            {payments.length === 0 && (
              <p role="alert" className="text-sm text-destructive">
                {t('noPayments')}
              </p>
            )}
            <div className="grid gap-3">
              {payments.map((method) => (
                <Choice
                  key={method.id}
                  name="payment"
                  value={String(method.id)}
                  checked={form.payment === method.id}
                  title={method.title}
                  note={method.note ?? undefined}
                  onChange={() => update({ payment: method.id })}
                />
              ))}
            </div>
            {errors.payment && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {error('payment')}
              </p>
            )}
          </Section>

          <Section title={t('comment')}>
            <textarea
              aria-label={t('comment')}
              value={form.comment}
              maxLength={1000}
              rows={3}
              placeholder={t('commentPlaceholder')}
              onChange={(event) => update({ comment: event.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus-visible:border-foreground"
            />
          </Section>

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="absolute -left-[9999px] size-px opacity-0"
          />
        </div>

        <aside className="rounded-xl bg-muted p-5 lg:sticky lg:top-24">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-lg">{t('summary')}</h2>
            <button
              type="button"
              onClick={() => cartActions.setOpen(true)}
              className="text-sm underline underline-offset-4 hover:no-underline"
            >
              {t('edit')}
            </button>
          </div>
          <OrderLines lines={inStock} totals={totals} bundlePercent={bundlePercent} />

          {notice && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-warm px-3 py-2 text-sm text-warm-foreground"
            >
              {t(notice)}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={pending || payments.length === 0}
            className="mt-4 h-12 w-full rounded-full text-sm font-semibold tracking-[0.1em] uppercase"
          >
            {pending ? t('submitting') : t('submit')}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {t.rich('consent', {
              offer: (chunks) => legalLink(legalLinks.offer, chunks),
              privacy: (chunks) => legalLink(legalLinks.privacy, chunks),
            })}
          </p>
        </aside>
      </div>
    </form>
  )
}

// The ordered lines with prices and the totals: the summary next to the form and on the thank-you screen.
function OrderLines({
  lines,
  totals,
  bundlePercent,
}: {
  lines: CartLine[]
  totals: ReturnType<typeof cartTotals>
  bundlePercent: number | null
}) {
  return (
    <>
      <ul className="divide-y divide-border">
        {lines.map((line) => (
          <li key={line.productId} className="flex gap-3 py-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-white">
              {line.view.image && (
                <Image
                  src={line.view.image.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="leading-snug font-semibold">{line.view.title}</p>
              <p className="text-xs text-muted-foreground">
                {line.view.variantName} · × {line.quantity}
              </p>
            </div>
            <LinePrice line={line} />
          </li>
        ))}
      </ul>
      <CartTotals
        totals={totals}
        bundlePercent={bundlePercent}
        className="mt-3 border-t border-border pt-3"
      />
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg">{title}</h2>
      {children}
    </section>
  )
}

function Choice({
  name,
  value,
  checked,
  title,
  note,
  onChange,
}: {
  name: string
  value: string
  checked: boolean
  title: string
  note?: string
  onChange: () => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
        checked ? 'border-foreground' : 'border-border hover:border-foreground/40',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <span>
        <span className="block text-base font-semibold">{title}</span>
        {note && <span className="text-sm text-muted-foreground">{note}</span>}
      </span>
    </label>
  )
}

function Field({
  label,
  value,
  error,
  onChange,
  ...input
}: {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const id = useId()
  return (
    <FormField id={id} label={label} error={error}>
      <input
        {...inputA11y(id, error)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName(error)}
        {...input}
      />
    </FormField>
  )
}

function legalLink(href: string | undefined, chunks: ReactNode) {
  if (!href) return chunks
  return (
    <Link href={href} target="_blank" className="underline hover:text-foreground">
      {chunks}
    </Link>
  )
}
