# Авторизация: модуль Users + модуль Auth (JWT)

## Контекст

Проект — свежесозданный монорепозиторий expense tracker (Turborepo/pnpm, NestJS backend, Next.js frontend, `packages/shared` с типами/DTO). Зависимости ещё не установлены, `apps/backend/src` содержит только заглушки (`main.ts`, `app.module.ts`), Prisma-схема пустая (нет моделей), модулей вообще нет.

Задача: добавить в API авторизацию — модуль пользователей (репозиторий + сервис) и отдельный модуль авторизации с JWT, методами login и register. Это первый feature-модуль в бэкенде, поэтому здесь же задаётся структурная конвенция (`src/modules/<feature>/`, `src/prisma/`).

Решения, подтверждённые пользователем:
- Хэширование пароля — **bcrypt**.
- DTO — гибридный подход: простые интерфейсы `LoginDto`/`RegisterDto` в `packages/shared` (по существующему паттерну `types/`/`dto/` + barrel-экспорт), и отдельные **классы** с `class-validator` в backend для `ValidationPipe`, структурно реализующие эти интерфейсы (`implements ...`).
- Модель `User`: `id`, `name`, `email` (unique), `passwordHash`, `isActive` (default true), `createdAt`, `updatedAt`. Без поля `role`.
- Взаимодействие между модулями — обычный Nest DI (`imports`/`exports`), без CQRS: масштаб (два простых синхронных use-case, однонаправленная зависимость `AuthModule` → `UsersService`) не оправдывает эту абстракцию.

## 1. Зависимости backend

`apps/backend/package.json`:

**dependencies:** `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`

**devDependencies:** `@types/bcrypt`, `@types/passport-jwt`

`@nestjs/config` добавляется дополнительно к явным требованиям — нужен для безопасного чтения `JWT_SECRET`/`JWT_EXPIRES_IN` через `ConfigService` вместо голого `process.env` (идиоматично для Nest, ничего не ломает, т.к. ещё ничего не установлено).

После правки — `pnpm install` из корня.

## 2. Prisma-схема

В `apps/backend/prisma/schema.prisma` добавить:

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}
```

Затем: `pnpm --filter @expense-tracker/backend prisma:migrate -- --name init` (первая миграция в проекте).

## 3. Структура новых файлов backend

```
apps/backend/src/
  prisma/
    prisma.module.ts       — @Global(), провайдер PrismaService
    prisma.service.ts      — extends PrismaClient, OnModuleInit/OnModuleDestroy
  modules/
    users/
      users.module.ts      — экспортирует только UsersService
      users.service.ts     — бизнес-логика (уникальность email, хэширование, toSafeUser)
      users.repository.ts  — тонкая обёртка над PrismaService (findById, findByEmail, create)
    auth/
      auth.module.ts       — импортирует UsersModule, PassportModule, JwtModule.registerAsync
      auth.controller.ts   — POST /auth/register, POST /auth/login, GET /auth/me (защищён)
      auth.service.ts      — register(), login(), buildAuthResponse()
      dto/
        register.dto.ts    — класс с class-validator, implements RegisterDto из shared
        login.dto.ts        — класс с class-validator, implements LoginDto из shared
      strategies/
        jwt.strategy.ts    — PassportStrategy(Strategy), validate(payload) → toSafeUser
      guards/
        jwt-auth.guard.ts  — AuthGuard("jwt")
      decorators/
        current-user.decorator.ts — @CurrentUser() из req.user
      types/
        jwt-payload.type.ts — { sub: string; email: string }
```

Разделение ответственности: **repository** — только доступ к данным через Prisma, без логики; **service** — хэширование пароля, проверка уникальности email, формирование "безопасного" пользователя (`SafeUser = Omit<User, "passwordHash">`).

`UsersModule` экспортирует только `UsersService` (не репозиторий) — это публичный API модуля для будущих потребителей (например, будущий `ExpensesModule`, которому понадобится проверять `usersService.findById(currentUserId)`).

`AuthModule` импортирует `UsersModule` и инжектирует `UsersService`; обратной зависимости нет — циклов избегаем.

Ключевые фрагменты:

- `UsersService.createUser({name, email, password})` — бросает `ConflictException`, если email уже занят, иначе хэширует пароль (`bcrypt.hash`, 10 раундов) и вызывает `usersRepository.create`.
- `UsersService.validatePassword(user, plainPassword)` — `bcrypt.compare`.
- `AuthService.register()` — вызывает `usersService.createUser`, затем строит JWT и возвращает `{ accessToken, user: SafeUser }`.
- `AuthService.login()` — ищет пользователя по email, проверяет `isActive` и пароль, бросает `UnauthorizedException` при неудаче, иначе тот же ответ.
- `JwtStrategy.validate(payload)` — подгружает пользователя по `payload.sub`, проверяет `isActive`, возвращает `toSafeUser(user)` (кладётся в `req.user`).
- `GET /auth/me` под `@UseGuards(JwtAuthGuard)` — минимальный защищённый роут для сквозной проверки гарда/стратегии.

## 4. Изменения в packages/shared

Новые файлы по существующему паттерну (`types/`, `dto/`, plain interfaces, barrel-экспорт):

- `packages/shared/src/dto/register.dto.ts` — `{ name: string; email: string; password: string }`
- `packages/shared/src/dto/login.dto.ts` — `{ email: string; password: string }`
- `packages/shared/src/types/user.ts` — `AuthUser { id, name, email, isActive, createdAt: string, updatedAt: string }` (без `passwordHash`; даты как `string`, т.к. так же оформлен `Expense.date` — они приходят как ISO-строки после сериализации в JSON)

Обновить `packages/shared/src/index.ts`, добавив экспорт этих трёх файлов.

## 5. Wiring

`apps/backend/src/app.module.ts` — импортировать `ConfigModule.forRoot({ isGlobal: true })`, `PrismaModule`, `UsersModule`, `AuthModule`.

`apps/backend/src/main.ts` — добавить глобальный `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`. `transform: true` обязателен, чтобы `@Body()` превращался в экземпляр class-validator DTO.

`apps/backend/.env.example` — добавить:
```
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="1d"
```
Корневой `.env.example` не трогаем — он содержит только `DATABASE_URL`.

## 6. Порядок реализации (этапы)

1. Зависимости в `package.json` → `pnpm install`.
2. Модель `User` в схеме → `prisma:migrate`.
3. Новые файлы в `packages/shared` (`user.ts`, `register.dto.ts`, `login.dto.ts`, обновить `index.ts`).
4. `PrismaModule`/`PrismaService`.
5. `UsersModule` (repository, service, module).
6. `AuthModule` (dto, strategy, guard, decorator, service, controller, module).
7. `AppModule`, `main.ts`, `.env.example`.

Примечание: на момент сохранения этого файла шаги 1–3 уже были частично выполнены и затем откачены по просьбе пользователя — реализацию начинать заново с шага 1.

## 7. Проверка

```bash
pnpm install
docker compose up -d
pnpm --filter @expense-tracker/backend prisma:migrate -- --name init
pnpm --filter @expense-tracker/backend dev
```

Далее curl-проверки:
- `POST /auth/register` с `{name, email, password}` → 200/201, `{accessToken, user}` без `passwordHash`.
- `POST /auth/login` с теми же данными → аналогичный ответ.
- `GET /auth/me` без токена → 401.
- `GET /auth/me` с `Authorization: Bearer <accessToken>` → 200, тело = безопасный пользователь.
- Повторная регистрация с тем же email → 409 Conflict.
- Регистрация с невалидным email / коротким паролем / лишним полем → 400 (проверка `whitelist`/`forbidNonWhitelisted`).
