# Expense Tracker

Монорепозиторий трекера расходов: Next.js (frontend) + NestJS (backend) + Prisma/PostgreSQL.

## Стек

- **Оркестрация монорепо:** Turborepo
- **Workspaces:** pnpm
- **Frontend:** Next.js (App Router), TypeScript
- **Backend:** NestJS, TypeScript
- **БД / ORM:** PostgreSQL + Prisma
- **Общий пакет:** `packages/shared` — типы и DTO, используемые и на frontend, и на backend

## Структура

```
apps/
  frontend/   # Next.js
  backend/    # NestJS + Prisma
packages/
  shared/     # общие типы и DTO
```

## Первый запуск

Зависимости пока не установлены — это только заготовка структуры проекта.

```bash
# установить pnpm, если его нет
npm install -g pnpm

# установить зависимости всех пакетов монорепо
pnpm install

# скопировать .env.example -> .env в apps/backend и apps/frontend (и в корне, если нужно)
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# поднять Postgres локально
docker compose up -d

# сгенерировать Prisma Client и применить миграции (после того как появятся модели в schema.prisma)
pnpm --filter @expense-tracker/backend prisma:generate
pnpm --filter @expense-tracker/backend prisma:migrate

# запустить frontend и backend одновременно
pnpm dev
```
