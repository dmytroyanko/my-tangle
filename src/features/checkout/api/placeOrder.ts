'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { cartTotals, getBundleDiscount, getCartLines, type CartLine } from '@/entities/cart'
import { getPaymentMethods } from '@/entities/payment-method'
import { routing, type Locale } from '@/shared/i18n'

import {
  displayPhone,
  normalizePhone,
  validateCheckout,
  type CheckoutError,
  type CheckoutField,
  type CheckoutForm,
} from '../model/form'

const MAX_QUANTITY = 20

export type PlaceOrderResult =
  | { ok: true; orderId: number }
  // The form has mistakes: messages per field.
  | { ok: false; reason: 'invalid'; errors: Partial<Record<CheckoutField, CheckoutError>> }
  // Something in the cart is gone, out of stock or repriced: the cart is shown again to confirm.
  | { ok: false; reason: 'cartChanged' | 'cartEmpty' | 'failed' }

// Creates an order from the checkout form and the cart. Prices, names and stock come from the products in
// the database; the browser sends only what was picked and how many. A bot that fills the hidden `website`
// field gets an empty success-like failure.
export async function placeOrder(input: {
  form: CheckoutForm
  items: { productId: number; quantity: number; price: number }[]
  locale: string
  website?: string
}): Promise<PlaceOrderResult> {
  if (input.website) return { ok: false, reason: 'failed' }
  const locale: Locale = (routing.locales as readonly string[]).includes(input.locale)
    ? (input.locale as Locale)
    : routing.defaultLocale

  const form: CheckoutForm = {
    lastName: String(input.form?.lastName ?? '').trim(),
    firstName: String(input.form?.firstName ?? '').trim(),
    phone: String(input.form?.phone ?? ''),
    email: String(input.form?.email ?? '').trim(),
    city: String(input.form?.city ?? '').slice(0, 200),
    cityRef: String(input.form?.cityRef ?? ''),
    warehouse: String(input.form?.warehouse ?? '').slice(0, 300),
    warehouseRef: String(input.form?.warehouseRef ?? ''),
    // Checked below against the methods switched on: an unknown one is an error, not a guess.
    payment: Number(input.form?.payment) || null,
    comment: String(input.form?.comment ?? '').slice(0, 1000),
  }
  const errors = validateCheckout(form)
  if (Object.keys(errors).length) return { ok: false, reason: 'invalid', errors }
  // A method switched on in the admin. The order keeps its Ukrainian name, as the managers read it, in case
  // it is renamed later.
  const methods = await getPaymentMethods('uk').catch((error) => {
    console.error('placeOrder:', error)
    return null
  })
  if (!methods) return { ok: false, reason: 'failed' }
  const payment = methods.find((method) => method.id === form.payment)
  if (!payment) return { ok: false, reason: 'invalid', errors: { payment: 'payment' } }

  const items = (Array.isArray(input.items) ? input.items : []).slice(0, 100)
  if (!items.length) return { ok: false, reason: 'cartEmpty' }
  const data = await getCartLines(items, locale)
  const byProduct = new Map(data.map((line) => [line.productId, line]))
  const lines: CartLine[] = items.flatMap((item) => {
    const line = byProduct.get(item.productId)
    if (!line) return []
    const { productId, ...view } = line
    const quantity = Math.min(Math.max(Math.round(Number(item.quantity) || 1), 1), MAX_QUANTITY)
    return [{ productId, quantity, view }]
  })
  // The customer confirms what they buy: any colour gone, out of stock or at another price than the one
  // shown sends them back to the updated cart instead of ordering silently.
  const changed =
    lines.length !== items.length ||
    lines.some((line) => !line.view.inStock) ||
    items.some((item) => byProduct.get(item.productId)?.price !== item.price)
  if (changed) return { ok: false, reason: 'cartChanged' }

  const totals = cartTotals(lines, await getBundleDiscount().catch(() => null))
  try {
    const payload = await getPayload({ config })
    const order = await payload.create({
      collection: 'orders',
      data: {
        status: 'new',
        locale,
        lastName: form.lastName,
        firstName: form.firstName,
        phone: displayPhone(form.phone),
        phoneNormalized: normalizePhone(form.phone),
        email: form.email || undefined,
        items: lines.map((line) => ({
          product: line.productId,
          title: line.view.title,
          variant: line.view.variantName,
          quantity: line.quantity,
          price: line.view.price,
          fullPrice: line.view.fullPrice,
        })),
        fullTotal: totals.fullTotal,
        discount: totals.saleDiscount + totals.bundleDiscount,
        total: totals.total,
        delivery: {
          method: 'nova-poshta',
          city: form.city,
          cityRef: form.cityRef,
          warehouse: form.warehouse,
          warehouseRef: form.warehouseRef,
        },
        paymentMethod: payment.id,
        payment: payment.title,
        comment: form.comment || undefined,
      },
    })
    return { ok: true, orderId: order.id }
  } catch (error) {
    console.error('placeOrder:', error)
    return { ok: false, reason: 'failed' }
  }
}
