import { after } from 'next/server'
import type { CollectionAfterChangeHook, Payload } from 'payload'

import { siteUrl } from '@/shared/config'

import type { Order } from '../payload-types'

// Tells the shop about a new order: a Telegram message to the orders chat (TELEGRAM_BOT_TOKEN and
// TELEGRAM_ORDERS_CHAT_ID) and an email to every user with "receive orders". A channel that is not set
// up is skipped, and a failed one is logged: the order is saved either way.
//
// The hook runs inside the create transaction, so the messages go out only after the response (Next.js
// `after`): the customer does not wait for Telegram or SMTP, and the order is read again first, so a
// create that was rolled back sends nothing. Outside a request (scripts) they go out a moment later.
export const notifyNewOrder: CollectionAfterChangeHook<Order> = ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const send = () => notify(doc.id, req.payload)
  try {
    after(send)
  } catch {
    setTimeout(send, 1000)
  }
  return doc
}

async function notify(id: number, payload: Payload) {
  try {
    const order = await payload.findByID({
      collection: 'orders',
      id,
      depth: 0,
      disableErrors: true,
    })
    if (!order) return
    const lines = describe(order)
    const results = await Promise.allSettled([
      sendTelegram(lines),
      sendEmails(order, lines, payload),
    ])
    for (const result of results)
      if (result.status === 'rejected')
        payload.logger.error({ err: result.reason }, 'notifyNewOrder')
  } catch (err) {
    payload.logger.error({ err }, 'notifyNewOrder')
  }
}

const money = (value: number | null | undefined) => `${(value ?? 0).toLocaleString('uk-UA')} грн`
const adminUrl = (id: number) => new URL(`/admin/collections/orders/${id}`, siteUrl).href

// The order as text lines, the same for both channels (unescaped).
function describe(order: Order) {
  const name = [order.lastName, order.firstName].filter(Boolean).join(' ')
  return {
    title: `Нове замовлення №${order.id}`,
    customer: [name, order.phone, order.email].filter(Boolean).join(', '),
    delivery: `Нова Пошта: ${order.delivery?.city ?? ''}, ${order.delivery?.warehouse ?? ''}`,
    items: (order.items ?? []).map(
      (item) =>
        `${item.title ?? ''} ${item.variant ?? ''} × ${item.quantity} — ${money(item.price * item.quantity)}`,
    ),
    total:
      order.discount && order.discount > 0
        ? `Разом: ${money(order.total)} (знижка ${money(order.discount)})`
        : `Разом: ${money(order.total)}`,
    payment: order.payment === 'online' ? 'Оплата: карткою онлайн' : 'Оплата: накладений платіж',
    comment: order.comment ? `Коментар: ${order.comment}` : null,
    link: adminUrl(order.id),
  }
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const TELEGRAM_LIMIT = 4096

async function sendTelegram(order: ReturnType<typeof describe>) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ORDERS_CHAT_ID
  if (!token || !chatId) return
  const head = [
    `<b>${escapeHtml(order.title)}</b>`,
    escapeHtml(order.customer),
    escapeHtml(order.delivery),
    '',
  ]
  const tail = [
    '',
    `<b>${escapeHtml(order.total)}</b>`,
    escapeHtml(order.payment),
    ...(order.comment ? [escapeHtml(order.comment)] : []),
    '',
    `<a href="${escapeHtml(order.link)}">Відкрити в адмінці</a>`,
  ]
  // Telegram refuses messages over 4096 characters: a long list is cut, the full order is in the admin.
  const items: string[] = []
  let size = [...head, ...tail].join('\n').length + 40
  for (const [index, item] of order.items.entries()) {
    const line = `• ${escapeHtml(item)}`
    if (size + line.length + 1 > TELEGRAM_LIMIT) {
      items.push(`… і ще ${order.items.length - index} поз.`)
      break
    }
    items.push(line)
    size += line.length + 1
  }
  const text = [...head, ...items, ...tail].join('\n')
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    }),
  })
  if (!response.ok) throw new Error(`Telegram: ${response.status} ${await response.text()}`)
}

async function sendEmails(doc: Order, order: ReturnType<typeof describe>, payload: Payload) {
  const { docs } = await payload.find({
    collection: 'users',
    where: { receiveOrders: { equals: true } },
    depth: 0,
    pagination: false,
    select: { email: true },
  })
  if (!docs.length) return
  const html = [
    `<h2>${escapeHtml(order.title)}</h2>`,
    `<p>${escapeHtml(order.customer)}<br>${escapeHtml(order.delivery)}</p>`,
    `<ul>${order.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`,
    `<p><b>${escapeHtml(order.total)}</b><br>${escapeHtml(order.payment)}</p>`,
    order.comment ? `<p>${escapeHtml(order.comment)}</p>` : '',
    `<p><a href="${escapeHtml(order.link)}">Відкрити в адмінці</a></p>`,
  ].join('')
  // One email per recipient: nobody sees the others' addresses, and one bad address fails only its own.
  const results = await Promise.allSettled(
    docs.map((user) =>
      payload.sendEmail({ to: user.email, subject: `${order.title} — ${money(doc.total)}`, html }),
    ),
  )
  const failed = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  )
  if (failed.length)
    throw new AggregateError(
      failed.map((result) => result.reason),
      'Email',
    )
}
