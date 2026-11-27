import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access'

// Analytics and advertising tags on every page of the site (not the admin), in production only. A tag is
// picked by type and its id, never pasted as code, so the admin cannot put arbitrary scripts on the site.
export const trackingTagTypes = [
  { label: 'Google Tag Manager (GTM-…)', value: 'gtm', pattern: /^GTM-[A-Z0-9]+$/ },
  {
    label: 'Тег Google: Analytics 4 (G-…) або Google Ads (AW-…)',
    value: 'gtag',
    pattern: /^(G|AW|DC)-[A-Z0-9]+$/,
  },
  { label: 'Meta Pixel (Facebook, Instagram)', value: 'meta', pattern: /^\d{5,20}$/ },
] as const

export const TrackingTags: CollectionConfig = {
  slug: 'tracking-tags',
  labels: { singular: 'Тег відстеження', plural: 'Теги відстеження' },
  admin: {
    group: 'Маркетинг',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'tagId', 'enabled'],
    description:
      'Google Analytics, Google Ads, Tag Manager, Meta Pixel. Працюють на всіх сторінках сайту, лише на робочому сервері.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      label: 'Назва',
      type: 'text',
      required: true,
      admin: { description: 'Для себе: «Google Analytics 4»' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Тип',
          type: 'select',
          required: true,
          options: trackingTagTypes.map(({ label, value }) => ({ label, value })),
        },
        {
          name: 'tagId',
          label: 'Ідентифікатор',
          type: 'text',
          required: true,
          admin: { description: 'GTM-XXXXXXX, G-XXXXXXXXXX, AW-123456789 або номер пікселя' },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData: { type?: string } },
          ) => {
            const type = trackingTagTypes.find((item) => item.value === siblingData.type)
            if (!value) return 'Вкажіть ідентифікатор'
            return (
              !type || type.pattern.test(value.trim()) || 'Ідентифікатор не підходить до типу тегу'
            )
          },
          hooks: {
            beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim() : value)],
          },
        },
      ],
    },
    {
      name: 'enabled',
      label: 'Увімкнено',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
