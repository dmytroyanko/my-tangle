import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

// The bundle discount (Tangle Teezer with Invisibobble in one order) in percent, or null while it is off in
// Shop settings: then neither the banner nor the cart mention it. Cached per request (the layout and the
// banner both ask).
export const getBundleDiscount = cache(async (): Promise<number | null> => {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  return settings.bundleDiscountEnabled ? settings.bundleDiscountPercent : null
})
