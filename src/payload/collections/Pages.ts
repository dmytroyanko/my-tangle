import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField({ useAsSlug: 'title', localized: true, slugify }),
    { name: 'content', type: 'richText', localized: true },
    {
      name: 'faq',
      label: 'Часті питання',
      type: 'array',
      // Per language, like the category FAQ. Shown under the text, one block per topic.
      localized: true,
      labels: { singular: 'Тема', plural: 'Теми' },
      admin: {
        initCollapsed: true,
        description: 'Питання й відповіді під текстом сторінки, згруповані за темами',
      },
      fields: [
        { name: 'title', label: 'Тема', type: 'text', required: true },
        {
          name: 'items',
          label: 'Питання',
          type: 'array',
          labels: { singular: 'Питання', plural: 'Питання' },
          fields: [
            { name: 'question', label: 'Питання', type: 'text', required: true },
            { name: 'answer', label: 'Відповідь', type: 'richText', required: true },
          ],
        },
      ],
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
