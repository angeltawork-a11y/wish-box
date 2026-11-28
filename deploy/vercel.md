# Деплой на Vercel + Neon

Рекомендуемый сценарий WL-24 для доступа из РФ без администрирования VPS.

Подробный пошаговый гайд для Ангелины: Project store `docs/wish-box-vercel-neon.md` (не в репозитории).

## Настройки проекта Vercel (авто)

| Параметр | Значение |
|----------|----------|
| Framework Preset | **Next.js** (определится из репозитория) |
| Root Directory | `.` |
| Build Command | `npm run build` (по умолчанию) |
| Output Directory | по умолчанию для Next.js |
| Install Command | `npm install` (по умолчанию) |

`npm run build` выполняет `next build`, затем `node scripts/migrate.mjs` — миграции **только если** в среде сборки задан `DATABASE_URL` (или `DATABASE_URL_UNPOOLED` в скрипте миграций).

## Neon: две строки подключения

В Neon Console → проект → **Connect**:

1. **`DATABASE_URL`** — режим **Pooled** (connection pooling, хост с `-pooler`). Используется приложением в runtime (serverless functions).
2. **`DATABASE_URL_UNPOOLED`** — режим **Direct** (без pooler). Используется **только** скриптом миграций при `npm run build`. Если не задать, миграции возьмут тот же `DATABASE_URL` (для Neon лучше явно указать Direct).

Обе строки обычно содержат `?sslmode=require`. Копируйте целиком, без правок.

Регион Neon: для РФ логичны **Europe** (Frankfurt / Stockholm) — задержка приемлема; free tier подходит для корпоративного wish-box.

## Environment Variables (Vercel)

**Settings → Environment Variables.** Для первого деплоя включите **Production** (и при желании Preview с теми же значениями).

| Переменная | Обязательно | Примечание |
|------------|-------------|------------|
| `DATABASE_URL` | да | Neon **Pooled** |
| `DATABASE_URL_UNPOOLED` | да | Neon **Direct** |
| `ADMIN_PASSWORD` | да | как в Cursor Secrets |
| `SESSION_SECRET` | да | как в Cursor Secrets |
| `STAFF_SEED_JSON` | нет | одна строка JSON; при пустой БД seed штата |
| `RESEND_API_KEY` | нет | email-коды сотрудникам |
| `MAIL_FROM` | нет | например `Коробка <noreply@домен.ru>` |

Задайте переменные **до** первого Production deploy (или сделайте **Redeploy** после добавления).

`STAFF_SEED_JSON`: в Vercel вставляйте компактный JSON в одну строку; большие значения допустимы. Источник в Project store: `internal/staff-seed-secret.json` (не коммитить в git).

## Деплой

1. [vercel.com](https://vercel.com) → **Add New → Project** → импорт `angeltawork-a11y/wish-box` с GitHub.
2. Добавьте переменные окружения (см. выше).
3. **Deploy**.
4. В логах сборки ищите строки `migrate: applied …` — без них БД пустая без таблиц (часто из‑за отсутствия `DATABASE_URL` на этапе build).

Production URL: `https://<имя-проекта>.vercel.app`.

## Проверка

- `/` — главная
- `/admin` — вход с `ADMIN_PASSWORD`
- `/employee` — поток сотрудника

Проверяйте **без VPN** с российского провайдера. `*.vercel.app` часто открывается из РФ; для рассылки сотрудникам надёжнее свой **.ru** (ниже).

## Свой домен `.ru` (позже)

Vercel → Project → **Settings → Domains** → Add → `желания.ваша-компания.ru`.

У регистратора: **CNAME** на значение из Vercel (часто `cname.vercel-dns.com`) или A-записи, если Vercel покажет IP. После делегирования DNS Vercel выпустит TLS автоматически.

## Ограничения serverless

- Rate limit по IP — in-memory в рамках одного инстанса (см. `src/lib/rate-limit.ts`); для типичной нагрузки wish-box обычно достаточно.
- Изображения желаний — **BYTEA в Postgres**, отдельный S3 не нужен.
- `output: "standalone"` в `next.config.ts` нужен для Docker; на Vercel не мешает.

## Сравнение с Cursor Publish

Те же имена секретов, что в Cursor Secrets. БД — **новая** Neon (или дамп со старой Postgres Cursor, если понадобится перенос данных — отдельная задача).

Старый URL `https://wish-box.apps.grok.bot` можно оставить до проверки нового, затем сделать private или снять публикацию.