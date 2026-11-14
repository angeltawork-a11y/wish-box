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

Если `ADMIN_PASSWORD` не задан, локальный образец пароля: `wishbox-admin` (показывается только в UI входа).

## Данные

Штат и желания хранятся в Postgres (`cursor-app.json` + `migrations/`). Без `DATABASE_URL` используется PGlite в памяти процесса.
