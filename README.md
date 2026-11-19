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

Фронтенд побудований за [Feature-Sliced Design](https://feature-sliced.design). Повні правила для розробників і AI-агентів — у `AGENTS.md`.

- `src/app` — роутер Next.js: `(frontend)/[locale]` — сайт, `(payload)` — адмінка і API (генерується Payload)
- `src/widgets`, `src/features`, `src/entities` — шари FSD (з'являються разом із першим кодом)
- `src/shared` — спільне: `ui` (shadcn/ui, `pnpm dlx shadcn@latest add <name>`), `lib`, `i18n`
- `src/payload` — бекенд: конфіг Payload, колекції, міграції, згенеровані типи
- `messages/` — тексти інтерфейсу для кожної мови

Після зміни колекцій: `pnpm generate:types` (і `pnpm generate:importmap`, якщо додано кастомні компоненти адмінки).

`pnpm lint` запускає ESLint і `steiger` — перевірку правил FSD (імпорти лише з нижчих шарів, через публічний API слайсу).

## Мови

Сайт двомовний: українська — основна, російська — додаткова.

- URL: українська без префікса (`/`, `/catalog/...`), російська з `/ru` (`/ru`, `/ru/catalog/...`). `/uk/...` перенаправляє на адресу без префікса. Мова береться лише з URL, автоматичного перенаправлення за мовою браузера немає.
- Тексти інтерфейсу (кнопки, підписи): `messages/uk.json` і `messages/ru.json`, однакові ключі в обох файлах.
- Контент в адмінці: перемикач мови вгорі документа. Назви, slug, описи, SEO-поля і alt фото заповнюються окремо для кожної мови; ціни, варіанти і фото — спільні. Якщо російського перекладу немає, показується український текст.
- Slug генерується з назви транслітерацією: українська — за офіційним стандартом (КМУ №55), російська — за звичайною веб-транслітерацією.
- Кожна сторінка віддає `canonical` і `hreflang` (uk, ru, x-default) через `alternates()` з `src/shared/i18n/alternates.ts`. Адреса сайту для цих посилань — змінна `SITE_URL`.
- Список мов задано у двох місцях: `src/shared/i18n/routing.ts` і `localization` у `src/payload/payload.config.ts`.

Після зміни колекцій: `pnpm generate:types` (і `pnpm generate:importmap`, якщо додано кастомні компоненти адмінки).

## Міграції бази

Локально (`pnpm dev`) Payload сам оновлює схему бази. Для продакшену зміни схеми фіксуються міграціями:

```bash
pnpm payload migrate:create <назва>   # після зміни колекцій, закомітити src/payload/migrations
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
