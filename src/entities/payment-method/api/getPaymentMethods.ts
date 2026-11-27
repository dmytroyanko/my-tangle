import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/shared/i18n'

export type PaymentMethodData = { id: number; title: string; note: string | null }

// The payment methods switched on in the admin, in their order: the first one is the checkout's default.
// Cached per request.
export const getPaymentMethods = cache(async (locale: Locale): Promise<PaymentMethodData[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'payment-methods',
    where: { enabled: { equals: true } },
    sort: ['order', 'createdAt'],
    locale,
    depth: 0,
    pagination: false,
    select: { title: true, note: true },
  })
  return docs.map((doc) => ({ id: doc.id, title: doc.title, note: doc.note || null }))
})
