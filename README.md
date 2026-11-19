# my-tangle

Інтернет-магазин [my-tangle.com.ua](https://my-tangle.com.ua): Next.js (App Router) + Payload CMS + Tailwind CSS + shadcn/ui, база Postgres.

## Локальний запуск

Потрібні Node 24 (див. `.nvmrc`), corepack і Docker.

```bash
nvm use
corepack enable pnpm          # pnpm версії з package.json
cp .env.example .env          # і задати PAYLOAD_SECRET: openssl rand -hex 32
docker compose up -d          # Postgres на порту 5433
pnpm install
pnpm dev
```

- Сайт: http://localhost:3000
- Адмінка: http://localhost:3000/admin (перший вхід створює адміністратора)

## Структура

- `src/app/(frontend)` — публічний сайт
- `src/app/(payload)` — адмінка і API Payload
- `src/collections` — колекції: товари, категорії, замовлення, сторінки, медіа, користувачі
- `src/components/ui` — компоненти shadcn/ui (`pnpm dlx shadcn@latest add <name>`)

Після зміни колекцій: `pnpm generate:types` (і `pnpm generate:importmap`, якщо додано кастомні компоненти адмінки).
