// Store phone numbers: `display` is shown, `href` is the tel: link.
export const phones = [
  { display: '(093) 046-93-83', href: 'tel:+380930469383' },
  { display: '(068) 670-85-32', href: 'tel:+380686708532' },
] as const

// Chats with the store: Telegram on the first phone number, Viber on its own number. Telegram opens in the
// browser or the app; Viber only in the app (it has no web version).
export const messengers = [
  { name: 'Telegram', href: 'https://t.me/+380930469383' },
  { name: 'Viber', href: 'viber://chat?number=%2B380938415232' },
] as const

// The store's founding year, the start of the copyright range.
export const foundedYear = 2007

// Working hours for structured data; the text shown on the site is in messages (ContactsPage). On weekends
// orders are only taken, so those days are not opening hours.
export const openingHours = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '10:00',
    closes: '19:00',
  },
] as const

// The store address on Google Maps.
export const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('вулиця Верховинна, 41, Київ')
