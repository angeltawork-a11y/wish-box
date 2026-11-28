# Деплой на Vercel (доступ из РФ через свой домен)

Подходит, если репозиторий на GitHub и нужен хостинг без `.grok.bot`.

## Шаги

1. [vercel.com](https://vercel.com) → Import → репозиторий `wish-box`, framework Next.js (определится сам).
2. Postgres: [Neon](https://neon.tech) или Vercel Postgres → скопируйте connection string.
3. Environment Variables (Production):

   | Переменная | Назначение |
   |------------|------------|
   | `DATABASE_URL` | pooled connection string |
   | `DATABASE_URL_UNPOOLED` | direct (для миграций в `npm run build`) |
   | `ADMIN_PASSWORD` | пароль админки |
   | `SESSION_SECRET` | длинная случайная строка |
   | `STAFF_SEED_JSON` | опционально, JSON штата |
   | `RESEND_API_KEY`, `MAIL_FROM` | опционально, почта |

4. Deploy. Миграции применяются при сборке (`npm run build` → `scripts/migrate.mjs`).
5. **Домен для РФ:** Vercel → Project → Domains → добавьте `желания.ваша-компания.ru` (или `.рф`). DNS у регистратора: CNAME на `cname.vercel-dns.com` (или A по подсказке Vercel).

Превью-URL `*.vercel.app` из РФ обычно открывается, но для сотрудников надёжнее **свой .ru/.рф**.

## Ограничения

- Лимитер по IP — in-memory на инстансе (на serverless сбрасывается между холодными стартами; для корпоративного трафика обычно достаточно).
- Изображения желаний — в Postgres (BYTEA), отдельное хранилище не нужно.