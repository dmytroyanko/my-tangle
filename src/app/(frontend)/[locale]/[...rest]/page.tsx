import { notFound } from 'next/navigation'

// Any address no other route matches (/a/b/c) gets the site's 404 page with the header and footer.
export default function CatchAll() {
  notFound()
}
