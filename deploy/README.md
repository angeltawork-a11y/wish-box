# Деплой вне Cursor (`*.apps.grok.bot`)

Приложение — **Next.js 15** + **Postgres** (в Cursor — managed DB; локально без `DATABASE_URL` — PGlite).

## Быстрый старт: Docker на VPS (РФ)

Timeweb Cloud, VK Cloud, Selectel, Yandex Compute и др. — любой сервер с Docker.

```bash
cp deploy/env.example .env
# Заполните ADMIN_PASSWORD, SESSION_SECRET, POSTGRES_PASSWORD
docker compose up -d --build
```

Сайт: `http://<IP>:3000`. Перед продакшеном — reverse proxy (nginx/caddy) + TLS + свой домен `.ru`.

Файлы: `Dockerfile`, `docker-compose.yml`, `deploy/env.example`.

## Vercel + Neon

См. [deploy/vercel.md](./vercel.md).

## Yandex Cloud (кратко)

1. **Managed PostgreSQL** — создать кластер, БД `wishbox`, взять строку подключения.
2. **Serverless Containers** или **VM** — образ из этого `Dockerfile` (Container Registry: `docker build` → push → задеплоить).
3. Переменные: те же, что в `deploy/env.example` + `DATABASE_URL`.
4. **Application Load Balancer** + сертификат + домен в Cloud DNS или у регистратора (A/ANAME на балансировщик).

Подробный чеклист для Ангелины — в Project store: `docs/wish-box-russia-hosting.md`.

## Секреты (все среды)

| Переменная | Обязательно | Примечание |
|------------|-------------|------------|
| `DATABASE_URL` | да (кроме dev без БД) | Postgres |
| `DATABASE_URL_UNPOOLED` | на Vercel/Neon | для миграций при build |
| `ADMIN_PASSWORD` | да | без значения админка недоступна |
| `SESSION_SECRET` | да | подпись cookie сотрудника |
| `STAFF_SEED_JSON` | нет | seed штата при пустой БД |
| `RESEND_API_KEY`, `MAIL_FROM` | нет | email-коды сотрудникам |

В Cursor Publish те же имена задаются в Secrets; при переносе экспортируйте значения из дашборда Cursor (не дублируйте в чат).