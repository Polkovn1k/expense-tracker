# TransactionsModule — модуль учёта доходов/расходов

## Контекст

ТЗ (`.claude/prompts/transactions.md`) требует центральный модуль приложения — `TransactionsModule` на backend: модель `Transaction`, связанная с `User` и `Category`, и CRUD-контроллер с фильтрацией и агрегацией (`/transactions/summary`). Это логичное продолжение уже существующих `auth`/`users`/`categories` модулей — транзакция ссылается на обе существующие сущности.

Уточнения, согласованные с пользователем:
- Поле `type` — enum `TransactionType { INCOME, EXPENSE }` в Prisma (типобезопасно, валидация на уровне БД и `@IsEnum` в DTO).
- `dateForm` в ТЗ — опечатка, реализуем как `dateFrom`.
- `GET /transactions/summary` возвращает `{ income, expense, balance }` за month/year.
- Только backend, фронтенд не трогаем.

## Модель данных (`apps/backend/prisma/schema.prisma`)

Добавить enum и модель:

```prisma
enum TransactionType {
  INCOME
  EXPENSE
}

model Transaction {
  id          String          @id @default(uuid())
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  description String?
  date        DateTime
  categoryId  String
  category    Category        @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime        @default(now())

  @@map("transactions")
}
```

- `User` получает `transactions Transaction[]`, `Category` — `transactions Transaction[]` (по аналогии с существующей связью `User.categories`).
- `amount` — `Decimal` (деньги), а не `Float`, чтобы избежать ошибок округления; в сервисе результат агрегации приводить к `number`.
- После правки схемы выполнить: `wsl.exe -e bash -lc "source ~/.nvm/nvm.sh && nvm use 24 && cd ~/projects/ai-projects/test-1 && pnpm --filter @expense-tracker/backend exec prisma migrate dev --name add-transactions"`.

## Shared-пакет (`packages/shared/src`)

По аналогии с `types/category.ts` + `dto/create-category.dto.ts` / `update-category.dto.ts`:

- `types/transaction.ts` — `export enum TransactionType { INCOME = "INCOME", EXPENSE = "EXPENSE" }` и `interface Transaction { id, amount: number, type: TransactionType, description?: string, date: string, categoryId: string, userId: string, createdAt: string }`.
- `dto/create-transaction.dto.ts` — `interface CreateTransactionDto { amount: number, type: TransactionType, description?: string, date: string, categoryId: string }` (`userId` не передаётся с клиента — берётся из JWT, как в `categories`).
- `dto/update-transaction.dto.ts` — все поля `CreateTransactionDto` опциональные.
- Зарегистрировать новые файлы через `export * from "./..."` в `packages/shared/src/index.ts` (после существующих строк для category/expense).

Существующие `types/expense.ts` и `create-expense.dto.ts`/`update-expense.dto.ts` не трогаем — это отдельная неиспользуемая заготовка, не относящаяся к текущей задаче.

## Backend-модуль (`apps/backend/src/modules/transactions/`)

Полностью повторить структуру `categories`: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `dto/`.

**DTO** (`dto/create-transaction.dto.ts`, `dto/update-transaction.dto.ts`) — как `create-category.dto.ts`/`update-category.dto.ts`, `implements` shared-интерфейс, class-validator:
- `amount`: `@IsNumber() @IsPositive()`
- `type`: `@IsEnum(TransactionType)`
- `description`: `@IsOptional() @IsString()`
- `date`: `@IsDateString()`
- `categoryId`: `@IsString() @IsUUID()`

**DTO для query-параметров** (новый паттерн, в проекте аналога нет):
- `dto/query-transactions.dto.ts` — `dateFrom?`, `dateTo?` (`@IsOptional() @IsDateString()`), `type?` (`@IsOptional() @IsEnum(TransactionType)`), `categoryId?` (`@IsOptional() @IsString()`).
- `dto/transactions-summary-query.dto.ts` — `month`, `year` — оба обязательные, `@IsInt() @Min/@Max` (месяц 1–12), с `@Type(() => Number)` из `class-transformer` (нужно для query-параметров, приходящих строками; `ValidationPipe` в `main.ts` уже стоит с `transform: true` — значит `@Type` сработает).

**Repository** (`transactions.repository.ts`, повторяет `categories.repository.ts`):
- `create(data: Prisma.TransactionCreateInput)`
- `findAllByUser(userId, filters: { dateFrom?, dateTo?, type?, categoryId? })` — собирает `where` через Prisma (`date: { gte, lte }`)
- `findById(id)`
- `update(id, data: Prisma.TransactionUpdateInput)`
- `delete(id)`
- `aggregateByUserAndPeriod(userId, dateFrom, dateTo)` — используя `prisma.transaction.groupBy({ by: ["type"], where: { userId, date: { gte, lt } }, _sum: { amount: true } })`

**Service** (`transactions.service.ts`, повторяет `categories.service.ts`, включая приватный `getOwnedOrThrow` с `NotFoundException`/`ForbiddenException`):
- `create(userId, dto)` — `connect` `user` и `category` (сначала проверить, что категория принадлежит userId — иначе `ForbiddenException`, аналогично owned-проверке).
- `findAll(userId, query)` → `repository.findAllByUser`.
- `findOne(userId, id)` → `getOwnedOrThrow`.
- `update(userId, id, dto)` → `getOwnedOrThrow` + repository.update.
- `remove(userId, id)` → `getOwnedOrThrow` + repository.delete.
- `summary(userId, month, year)` — вычисляет диапазон дат месяца (`new Date(year, month-1, 1)` … начало следующего месяца), вызывает `aggregateByUserAndPeriod`, сворачивает в `{ income, expense, balance }` (сумма из `_sum.amount` по каждому `type`, дефолт 0, `balance = income - expense`).

**Controller** (`transactions.controller.ts`, `@Controller("transactions")`, `@UseGuards(JwtAuthGuard)`):
- `POST /transactions` → `create`
- `GET /transactions` → `findAll` (`@Query() query: QueryTransactionsDto`)
- `GET /transactions/summary` → `summary` (`@Query() query: TransactionsSummaryQueryDto`) — **важно**: этот маршрут должен быть объявлен в контроллере раньше `GET /transactions/:id`, иначе Nest матчит `"summary"` как `:id`.
- `GET /transactions/:id` → `findOne`
- `PATCH /transactions/:id` → `update`
- `DELETE /transactions/:id` → `remove`

Все методы получают пользователя через `@CurrentUser() user: SafeUser`, как в `categories.controller.ts`.

**Module** (`transactions.module.ts`): `controllers: [TransactionsController]`, `providers: [TransactionsService, TransactionsRepository]`, зарегистрировать `TransactionsModule` в `apps/backend/src/app.module.ts` (imports, после `CategoriesModule`).

## Ограничения / проверка

- Никаких новых зависимостей — всё уже есть (`class-validator`, `class-transformer`, `@nestjs/common`, Prisma).
- После реализации собрать проект: `wsl.exe -e bash -lc "source ~/.nvm/nvm.sh && nvm use 24 && cd ~/projects/ai-projects/test-1 && pnpm build"`.
- Дополнительно прогнать `pnpm --filter @expense-tracker/backend prisma:generate` перед сборкой, чтобы обновились Prisma-типы (`Transaction`, `TransactionType`) после миграции.

## Чеклист реализации

- [x] `packages/shared/src/types/transaction.ts` — enum `TransactionType` + interface `Transaction`
- [x] `packages/shared/src/dto/create-transaction.dto.ts`
- [x] `packages/shared/src/dto/update-transaction.dto.ts`
- [x] Экспорты новых файлов в `packages/shared/src/index.ts`
- [x] `apps/backend/prisma/schema.prisma`: enum `TransactionType`, модель `Transaction`, обратные связи `transactions Transaction[]` на `User` и `Category`
- [x] Миграция: `prisma migrate dev --name add-transactions`
- [x] `apps/backend/src/modules/transactions/dto/create-transaction.dto.ts`
- [x] `apps/backend/src/modules/transactions/dto/update-transaction.dto.ts`
- [x] `apps/backend/src/modules/transactions/dto/query-transactions.dto.ts`
- [x] `apps/backend/src/modules/transactions/dto/transactions-summary-query.dto.ts`
- [x] `apps/backend/src/modules/transactions/transactions.repository.ts`
- [x] `apps/backend/src/modules/transactions/transactions.service.ts`
- [x] `apps/backend/src/modules/transactions/transactions.controller.ts`
- [x] `apps/backend/src/modules/transactions/transactions.module.ts`
- [x] Регистрация `TransactionsModule` в `apps/backend/src/app.module.ts`
- [x] `prisma:generate` (выполнен автоматически как часть `prisma migrate dev`)
- [x] `pnpm build` — сборка проходит без ошибок (shared, backend, frontend)
