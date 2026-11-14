# Волшебный ящик желаний

Веб-приложение для сбора желаний сотрудников.

## Локально

```bash
npm install
env -u DATABASE_URL npm run dev
```

Откройте http://127.0.0.1:3000

- Форма желаний: `/`
- Админ (желания): `/admin`
- Справочник: `/admin/staff`

Для проверки админки задайте `ADMIN_PASSWORD` в окружении (без него вход недоступен):

```bash
ADMIN_PASSWORD='your-local-password' env -u DATABASE_URL npm run dev
```

В опубликованном приложении задайте `ADMIN_PASSWORD` через Secrets Cursor.

## Данные

Штат и желания хранятся в Postgres (`cursor-app.json` + `migrations/`). Без `DATABASE_URL` используется PGlite в памяти процесса.
