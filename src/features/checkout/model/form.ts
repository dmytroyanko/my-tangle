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

// The phone field shows "+38" as a fixed label and holds the rest the usual way, from 0: "093 255 70 00".
// Typed digits are grouped; a number typed without the 0 gets it. A whole number pasted or autofilled in
// any form (+380932557000, 380932557000, +38 (093) 255-70-00, 932557000) keeps its own digits.
export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '')
  // The country code typed or pasted out of habit: drop the 38 (no national number starts with 380, and one
  // longer than 10 digits that starts with 38 has the code in front).
  if (digits.startsWith('380') || (digits.length > 10 && digits.startsWith('38')))
    digits = digits.slice(2)
  // A number typed without its 0 gets it, except "3" and "38", which may still become the code.
  if (digits && !digits.startsWith('0') && digits !== '3' && digits !== '38') digits = `0${digits}`
  digits = digits.slice(0, 10)
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
    .filter(Boolean)
    .join(' ')
}

// The number for the order and the waybill: "+38 093 255 70 00".
export const displayPhone = (value: string) => `+38 ${formatPhoneInput(value)}`

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
