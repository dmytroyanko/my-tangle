import path from 'path'
import type { CollectionConfig } from 'payload'

import { contentEditors } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: contentEditors,
    update: contentEditors,
    delete: contentEditors,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      // Alt text is read by search engines, so it is written per language.
      localized: true,
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
  },
}
