import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

import { contentEditors, publishedOrEditors } from '../access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
  },
  access: {
    read: publishedOrEditors,
    readVersions: contentEditors,
    create: contentEditors,
    update: contentEditors,
    delete: contentEditors,
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'navTitle',
      label: 'Коротка назва',
      type: 'text',
      localized: true,
      admin: { description: 'Для посилань у футері; порожньо — повна назва' },
    },
    slugField({ useAsSlug: 'title', localized: true, slugify }),
    {
      type: 'row',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'showInFooter',
          label: 'Показувати у футері',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'footerOrder',
          label: 'Порядок у футері',
          type: 'number',
          defaultValue: 0,
          admin: { description: 'Менше — вище' },
        },
      ],
    },
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
