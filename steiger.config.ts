import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // src/app is the Next.js router and the FSD app layer; it stays checked so usages from pages count.
    // Ignored (parentheses are glob syntax, hence the brackets): the generated Payload admin/API routes, the backend (outside FSD) and Next root files.
    ignores: ['./src/app/[(]payload[)]/**', './src/payload/**', './src/*.ts'],
  },
  {
    // While the store is young most slices have one consumer; report it without failing lint.
    rules: { 'fsd/insignificant-slice': 'warn' },
  },
])
