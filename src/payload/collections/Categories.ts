import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField({ useAsSlug: 'title', localized: true, slugify }),
    {
      name: 'heading',
      type: 'text',
      localized: true,
      admin: { description: 'Заголовок блоку на головній, якщо відрізняється від назви' },
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
      admin: { description: 'Підзаголовок під заголовком блоку' },
    },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'faq',
      label: 'Часті питання',
      type: 'array',
      // Per language, so a translation can have its own set of questions.
      localized: true,
      labels: { singular: 'Питання', plural: 'Питання' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'question', label: 'Питання', type: 'text', required: true },
        { name: 'answer', label: 'Відповідь', type: 'richText', required: true },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Порядок у меню та на головній' },
    },
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'category',
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
