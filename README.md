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

### Локальна база: `pnpm dev` не відповідає

Якщо після зміни колекцій (або після переходу на іншу гілку) `pnpm dev` запустився, але сайт, адмінка і API не відповідають, — Payload чекає відповіді в терміналі, де запущено `pnpm dev`. Він підганяє схему локальної бази під колекції і питає, як змінити таблиці, наприклад:

```
Is snapshot column in _pages_v table created or renamed from another column?
❯ + snapshot   create column
```

Поки відповіді немає, сервер не віддає жодної сторінки. Два способи:

- **Відповісти в терміналі.** Для нових полів — `+ ... create column` (Enter на першому пункті), на питання про втрату даних — `y`. Перейменування (`~ ... rename column`) обирати лише тоді, коли поле справді перейменовано, щоб зберегти дані.
- **Створити локальну базу заново**, якщо в ній немає нічого потрібного:

  ```bash
  # зупинити pnpm dev (Ctrl+C), потім:
  docker compose down -v && docker compose up -d
  pnpm dev
  ```

  `docker compose down` зупиняє і видаляє контейнер Postgres, `-v` — разом із томами з `docker-compose.yml`: `pgdata`, тобто всі дані локальної бази (користувачі, товари, сторінки), і `media`, якщо запускали `docker compose --profile app`. `docker compose up -d` створює порожню базу; Payload заповнить схему при першому запуску `pnpm dev`, а адміністратора треба створити знову на http://localhost:3000/admin. Продакшен, R2 і папку `media/` у проєкті (куди `pnpm dev` зберігає фото) це не зачіпає.

### Наповнення каталогу

Категорії з серіями, кольорами й фото завантажуються в базу скриптом. Кожна категорія — окремий файл у `src/payload/seed/catalog/` (`ultimate-detangler.json`, `the-complete-carebrush.json`, `the-original-children-mini.json`): назви, ціни й серії зі старого сайту, фото з сайту виробника (для кольорів, яких там немає, — зі старого сайту або постачальника).

```bash
pnpm payload run src/payload/seed/catalog.ts                                  # усі категорії
CATEGORY=the-complete-carebrush pnpm payload run src/payload/seed/catalog.ts  # одна категорія
```

Скрипт завантажує фото, стискає їх до WebP (до 1600px) і зберігає в медіа Payload. Повторний запуск безпечний: він лише додає те, чого ще немає, і не чіпає категорії й товари, які вже є в базі (їх редагують в адмінці). Щоб перезаписати їх даними з JSON, запустіть з `SEED_UPDATE=1`:

```bash
SEED_UPDATE=1 CATEGORY=the-complete-carebrush pnpm payload run src/payload/seed/catalog.ts
```

Фото не дублюються: скрипт знаходить уже завантажені за назвою файлу.

### Невикористані медіа

Після заміни фото або видалення товарів старі файли лишаються в медіа. Скрипт показує файли, які не використовує жоден товар, категорія чи сторінка (обидві мови, чернетки теж), а з `CLEANUP_APPLY=1` видаляє їх. Видалення незворотне, тому спершу перегляньте список:

```bash
pnpm payload run src/payload/seed/cleanup-media.ts
CLEANUP_APPLY=1 pnpm payload run src/payload/seed/cleanup-media.ts
```

## Редіректи при переїзді

Адреси старого сайту на Webflow закінчуються на `.html` (`/kontakty.html`); без `.html` вони віддають 404. Під час переходу кожна стара (російськомовна) адреса `/<slug>.html` перенаправляється 301 на `/ru/<slug>`. Адреси, у яких змінився сам slug:

| Стара адреса | Нова адреса |
|---|---|
| `/the-wet-detangler.html` | `/ru/the-ultimate-detangler` |

## Docker (продакшен)

```bash
docker compose --profile app up --build   # застосунок + Postgres, http://localhost:3000
```

Обов'язкові змінні: `PAYLOAD_SECRET`, `DATABASE_URL`. Без них контейнер завершується з помилкою одразу при старті.

## Фото товарів

- Якщо задано `S3_BUCKET` (+ `S3_ENDPOINT`, ключі), файли зберігаються в Cloudflare R2 або іншому S3-сумісному сховищі.
- Інакше — на диску в `MEDIA_DIR` (у контейнері `/app/media`, у docker-compose це том `media`).
