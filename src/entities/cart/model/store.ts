'use client'

import { useSyncExternalStore } from 'react'

import type { CartLine } from './types'

// The cart lives in this browser (localStorage), so it survives reloads and new visits, and other tabs
// follow changes. Prices in it are only for display: the order takes them from the server.
const STORAGE_KEY = 'my-tangle-cart'
export const MAX_QUANTITY = 20

// `ready`: the saved cart has been read (false on the server and before hydration).
type CartState = { lines: CartLine[]; open: boolean; ready: boolean }

const EMPTY: CartState = { lines: [], open: false, ready: false }
const clamp = (quantity: number) => Math.min(Math.max(Math.round(quantity), 1), MAX_QUANTITY)
let state: CartState = EMPTY
let loaded = false
const listeners = new Set<() => void>()

// The saved cart is data from the browser, so it is checked line by line: a line in an old format, cut off
// by a closed tab or edited by hand is dropped instead of breaking every page (the header and the cart panel
// are in the layout). A different format version starts an empty cart.
// Version 2: a line is a product (one colour per product), no longer a colour row of a product.
const FORMAT_VERSION = 2

const isImage = (value: unknown): value is CartLine['view']['image'] => {
  if (value === null) return true
  const image = value as Record<string, unknown> | undefined
  return (
    typeof image?.url === 'string' &&
    typeof image.width === 'number' &&
    typeof image.height === 'number' &&
    typeof image.alt === 'string'
  )
}

function toLine(value: unknown): CartLine | null {
  const line = value as Record<string, unknown> | null
  const view = line?.view as Record<string, unknown> | undefined
  if (
    !line ||
    !view ||
    !Number.isInteger(line.productId) ||
    typeof line.quantity !== 'number' ||
    !Number.isFinite(line.quantity) ||
    typeof view.title !== 'string' ||
    typeof view.variantName !== 'string' ||
    typeof view.price !== 'number' ||
    !(view.fullPrice === null || typeof view.fullPrice === 'number') ||
    typeof view.href !== 'string' ||
    !view.href.startsWith('/') ||
    typeof view.inStock !== 'boolean' ||
    !(view.brand === undefined || typeof view.brand === 'string') ||
    !isImage(view.image)
  )
    return null
  return {
    productId: line.productId as number,
    quantity: clamp(line.quantity),
    view: view as CartLine['view'],
  }
}

function read(): CartLine[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved?.version !== FORMAT_VERSION || !Array.isArray(saved.lines)) return []
    const seen = new Set<number>()
    return saved.lines.flatMap((value: unknown) => {
      const line = toLine(value)
      if (!line || seen.has(line.productId)) return []
      seen.add(line.productId)
      return [line]
    })
  } catch {
    return []
  }
}

function set(next: Partial<CartState>) {
  state = { ...state, ...next }
  if (next.lines) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: FORMAT_VERSION, lines: state.lines }),
      )
    } catch {
      // Storage full or blocked (private mode): the cart still works for this visit.
    }
  }
  listeners.forEach((listener) => listener())
}

// One listener for changes from other tabs, added with the first subscriber and removed with the last.
function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) set({ lines: read() })
}

function subscribe(listener: () => void) {
  if (!loaded) {
    loaded = true
    state = { ...state, lines: read(), ready: true }
  }
  if (!listeners.size) window.addEventListener('storage', onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('storage', onStorage)
  }
}

export const cartActions = {
  // Adds a colour (or one more of it) and opens the cart.
  add(line: Omit<CartLine, 'quantity'>, quantity = 1) {
    const existing = state.lines.find((item) => item.productId === line.productId)
    // An existing line keeps its view: the server-confirmed one (price, brand) is newer than the card's.
    const lines = existing
      ? state.lines.map((item) =>
          item === existing ? { ...item, quantity: clamp(item.quantity + quantity) } : item,
        )
      : [...state.lines, { ...line, quantity: clamp(quantity) }]
    set({ lines, open: true })
  },
  setQuantity(productId: number, quantity: number) {
    set({
      lines: state.lines.map((item) =>
        item.productId === productId ? { ...item, quantity: clamp(quantity) } : item,
      ),
    })
  },
  remove(productId: number) {
    set({ lines: state.lines.filter((item) => item.productId !== productId) })
  },
  // Current data from the server; lines it no longer knows (deleted products) are dropped.
  refresh(views: Map<number, CartLine['view']>) {
    set({
      lines: state.lines.flatMap((item) => {
        const view = views.get(item.productId)
        return view ? [{ ...item, view }] : []
      }),
    })
  },
  clear() {
    set({ lines: [] })
  },
  setOpen(open: boolean) {
    set({ open })
  },
}

// The cart in a client component. On the server and before hydration it is empty, so the HTML does not
// depend on the visitor's cart.
export function useCart(): CartState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  )
}
