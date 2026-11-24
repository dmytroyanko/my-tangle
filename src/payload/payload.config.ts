import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import { uk } from '@payloadcms/translations/languages/uk'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Pages } from './collections/Pages'
import { Orders } from './collections/Orders'
import { ShopSettings } from './globals/ShopSettings'
import { requireEnv } from '@/shared/lib/env'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    // Same favicon as the site (files in public/).
    meta: {
      icons: [
        { rel: 'icon', url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { rel: 'icon', type: 'image/png', url: '/icon.png', sizes: '134x134' },
      ],
    },
    importMap: {
      // Custom admin component paths are resolved from src/.
      baseDir: path.resolve(dirname, '..'),
    },
  },
  collections: [Products, Categories, Orders, Pages, Media, Users],
  globals: [ShopSettings],
  editor: lexicalEditor(),
  // Content languages. Keep in sync with src/shared/i18n/routing.ts.
  localization: {
    locales: [
      { label: 'Українська', code: 'uk' },
      { label: 'Русский', code: 'ru' },
    ],
    defaultLocale: 'uk',
    // Untranslated fields show the Ukrainian text instead of being empty.
    fallback: true,
  },
  // Admin panel interface languages.
  i18n: {
    supportedLanguages: { uk, ru, en },
    fallbackLanguage: 'uk',
  },
  secret: requireEnv('PAYLOAD_SECRET'),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: requireEnv('DATABASE_URL'),
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Dev uses schema push; production applies these on startup.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Media goes to S3-compatible storage (Cloudflare R2) when S3_BUCKET is set, otherwise to MEDIA_DIR on disk.
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      alwaysInsertFields: true,
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
