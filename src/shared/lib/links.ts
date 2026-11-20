import { siteUrl } from '@/shared/config'

// A link to another website (http/https, not our own domain). mailto: and tel: are not external sites.
export function isExternalUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) return false
  try {
    return new URL(url).host !== new URL(siteUrl).host
  } catch {
    // A malformed address typed in the admin is treated as external, so it still gets nofollow.
    return true
  }
}

// Attributes for links to other websites: we do not pass link weight (nofollow) or the referrer
// (noreferrer), and they open in a new tab (noopener).
export const externalLinkProps = { rel: 'nofollow noopener noreferrer', target: '_blank' } as const
