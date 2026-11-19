import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '../lib/slugify'

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
    { name: 'description', type: 'richText', localized: true },
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
