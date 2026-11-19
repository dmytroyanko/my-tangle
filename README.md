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

## Міграції бази

Локально (`pnpm dev`) Payload сам оновлює схему бази. Для продакшену зміни схеми фіксуються міграціями:

```bash
pnpm payload migrate:create <назва>   # після зміни колекцій, закомітити src/migrations
```

Продакшен-сервер застосовує нові міграції автоматично при старті (`prodMigrations`).

## Docker (продакшен)

```bash
docker compose --profile app up --build   # застосунок + Postgres, http://localhost:3000
```

Обов'язкові змінні: `PAYLOAD_SECRET`, `DATABASE_URL`. Без них контейнер завершується з помилкою одразу при старті.

## Фото товарів

- Якщо задано `S3_BUCKET` (+ `S3_ENDPOINT`, ключі), файли зберігаються в Cloudflare R2 або іншому S3-сумісному сховищі.
- Інакше — на диску в `MEDIA_DIR` (у контейнері `/app/media`, у docker-compose це том `media`).
