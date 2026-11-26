import type { GlobalConfig } from 'payload'

import { contentEditors } from '../access'

// Content of the home page that is not a category: the questions under the catalog.
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Головна сторінка',
  access: {
    read: () => true,
    update: contentEditors,
  },
  fields: [
    {
      name: 'faq',
      label: 'Часті питання',
      type: 'array',
      // Per language, like the category FAQ. Shown under the categories, e.g. care tips shared by all brushes.
      localized: true,
      labels: { singular: 'Питання', plural: 'Питання' },
      admin: {
        initCollapsed: true,
        description: 'Блок під категоріями на головній; порожньо — блок не показується',
      },
      fields: [
        { name: 'question', label: 'Питання', type: 'text', required: true },
        { name: 'answer', label: 'Відповідь', type: 'richText', required: true },
      ],
    },
  ],
}
