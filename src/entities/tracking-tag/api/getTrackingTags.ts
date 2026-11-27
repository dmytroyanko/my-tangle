import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { TrackingTag } from '@/payload/payload-types'

export type TrackingTagData = Pick<TrackingTag, 'type' | 'tagId'>

// The tags switched on in the admin (Маркетинг → Теги відстеження). Cached per request.
export const getTrackingTags = cache(async (): Promise<TrackingTagData[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tracking-tags',
    where: { enabled: { equals: true } },
    sort: 'createdAt',
    depth: 0,
    pagination: false,
    select: { type: true, tagId: true },
  })
  return docs.map(({ type, tagId }) => ({ type, tagId }))
})
