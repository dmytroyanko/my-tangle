'use server'

// Nova Poshta directory search for the checkout: cities and branches/parcel lockers. The requests go from
// our server, so the API key (NOVA_POSHTA_API_KEY, optional for these methods) never reaches the browser.
const API_URL = 'https://api.novaposhta.ua/v2.0/json/'

export type NpOption = { ref: string; name: string }

async function call<T>(
  calledMethod: string,
  methodProperties: Record<string, string>,
): Promise<T[]> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: process.env.NOVA_POSHTA_API_KEY ?? '',
      modelName: 'AddressGeneral',
      calledMethod,
      methodProperties,
    }),
    // Directories change rarely; the same search is reused for an hour.
    next: { revalidate: 3600 },
  })
  if (!response.ok) throw new Error(`Nova Poshta ${calledMethod}: ${response.status}`)
  const body = (await response.json()) as { success: boolean; data: T[] }
  if (!body.success) throw new Error(`Nova Poshta ${calledMethod} failed`)
  return body.data
}

// Settlements served by Nova Poshta whose name starts with the query. `ref` is the city ref the branch
// search needs (DeliveryCity).
export async function searchCities(query: string): Promise<NpOption[]> {
  const name = query.trim().slice(0, 60)
  if (name.length < 2) return []
  const data = await call<{
    Addresses: { DeliveryCity: string; Present: string; Warehouses: number }[]
  }>('searchSettlements', { CityName: name, Limit: '20', Page: '1' })
  return (data[0]?.Addresses ?? [])
    .filter((address) => address.Warehouses > 0)
    .map((address) => ({ ref: address.DeliveryCity, name: address.Present }))
}

// Branches and parcel lockers of a city, optionally filtered by number or street, in the page language.
export async function searchWarehouses(
  cityRef: string,
  query: string,
  locale: string,
): Promise<NpOption[]> {
  if (!/^[0-9a-f-]{36}$/i.test(cityRef)) return []
  const data = await call<{ Ref: string; Description: string; DescriptionRu: string }>(
    'getWarehouses',
    { CityRef: cityRef, FindByString: query.trim().slice(0, 60), Limit: '50', Page: '1' },
  )
  const options = data.map((warehouse) => ({
    ref: warehouse.Ref,
    name:
      locale === 'ru' && warehouse.DescriptionRu ? warehouse.DescriptionRu : warehouse.Description,
  }))
  // Nova Poshta matches a number anywhere ("35" also finds №1 at house 135), so the branch with that exact
  // number goes first.
  const number = query.trim()
  if (!/^\d+$/.test(number)) return options
  const exact = (option: NpOption) => new RegExp(`№${number}(?!\\d)`).test(option.name)
  return [...options.filter(exact), ...options.filter((option) => !exact(option))]
}
