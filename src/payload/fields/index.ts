import type { Field } from 'payload'

// Fields used by several collections, so they look and are stored the same everywhere.

// A question with its answer: the FAQ of categories, pages and the home page.
export const faqItemFields: Field[] = [
  { name: 'question', label: 'Питання', type: 'text', required: true },
  { name: 'answer', label: 'Відповідь', type: 'richText', required: true },
]

// SEO title, description and social preview of a page; empty fields fall back to the page's own texts.
export const metaField: Field = {
  name: 'meta',
  type: 'group',
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
