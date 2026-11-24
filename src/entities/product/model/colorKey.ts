import { toSlug } from '@/shared/lib/slugify'

// URL key of a colour ("olive-green"), for ?color= on the product page.
export const colorKey = (name: string) => toSlug(name)
