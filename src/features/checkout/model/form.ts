// The checkout form, shared by the browser (instant hints) and the server (the check that counts).

export type CheckoutForm = {
  lastName: string
  firstName: string
  phone: string
  email: string
  city: string
  cityRef: string
  warehouse: string
  warehouseRef: string
  payment: PaymentMethod
  comment: string
}

// Apple Pay / Google Pay (the default), a card payment by the shop's bank details, cash on delivery, in the
// order the checkout lists them.
export const paymentMethods = ['wallet', 'card', 'cod'] as const
export type PaymentMethod = (typeof paymentMethods)[number]

export type CheckoutField = keyof CheckoutForm
// Message keys under Checkout.errors.
export type CheckoutError =
  'required' | 'phone' | 'email' | 'name' | 'city' | 'warehouse' | 'payment'

// A Ukrainian phone as +380XXXXXXXXX, from the ways people type it (0671234567, 380671234567,
// +38 (067) 123-45-67), or null when it is not one.
export function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  const national = digits.startsWith('380')
    ? digits.slice(3)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits
  return /^\d{9}$/.test(national) ? `+380${national}` : null
}

// Names as Nova Poshta accepts them on a waybill: letters, apostrophe, hyphen and spaces.
const NAME = /^[\p{L}][\p{L}'’ʼ\- ]{0,49}$/u

export function validateCheckout(
  form: CheckoutForm,
): Partial<Record<CheckoutField, CheckoutError>> {
  const errors: Partial<Record<CheckoutField, CheckoutError>> = {}
  for (const field of ['lastName', 'firstName'] as const) {
    const value = form[field].trim()
    if (!value) errors[field] = 'required'
    else if (!NAME.test(value)) errors[field] = 'name'
  }
  if (!form.phone.trim()) errors.phone = 'required'
  else if (!normalizePhone(form.phone)) errors.phone = 'phone'
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'email'
  if (!form.cityRef) errors.city = 'city'
  if (!form.warehouseRef) errors.warehouse = 'warehouse'
  if (!paymentMethods.includes(form.payment)) errors.payment = 'payment'
  return errors
}
