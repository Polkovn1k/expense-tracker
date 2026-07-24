# Категории трат (Category) — CRUD

## Контекст

Авторизация уже реализована: `JwtAuthGuard` (`apps/backend/src/modules/auth/guards/jwt-auth.guard.ts`) и декоратор `@CurrentUser()` (`apps/backend/src/modules/auth/decorators/current-user.decorator.ts`), возвращающий `SafeUser` из `request.user`. Глобальный `ValidationPipe` (`whitelist/forbidNonWhitelisted/transform: true`) уже настроен в `apps/backend/src/main.ts`, class-validator/class-transformer уже установлены.

В Prisma-схеме (`apps/backend/prisma/schema.prisma`) сейчас есть только модель `User` (id — `String @id @default(uuid())`). Сущности `Category` в БД ещё нет. В `packages/shared/src/types/category.ts` уже есть частичный тип `Category { id, name, icon? }` — без `color` и `userId`, и без `CreateCategoryDto`/`UpdateCategoryDto` (в отличие от `Expense`, для которого DTO уже есть). Задача: добавить сущность `Category` (id, name, color, icon, userId) и полноценный CRUD (create/findAll/update/delete), защищённый тем же `JwtAuthGuard`, с валидацией через class-validator, скоуп — только категории текущего пользователя.

Модуль `users` — образец многослойной структуры (module/service/repository), `AuthController` — образец стиля контроллера (`@UseGuards(JwtAuthGuard)`, `@CurrentUser() user: SafeUser`, `@Body() dto: XDto`). Оба паттерна переиспользуются один в один.

## 1. Prisma schema (`apps/backend/prisma/schema.prisma`)

Добавить модель `Category` и обратную связь на `User`:

```prisma
model User {
  id           String     @id @default(uuid())
  name         String
  email        String     @unique
  passwordHash String
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  categories   Category[]

  @@map("users")
}

model Category {
  id        String   @id @default(uuid())
  name      String
  color     String
  icon      String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("categories")
}
```

После правки схемы: `pnpm --filter @expense-tracker/backend prisma:migrate` (создаст миграцию и применит к БД) — выполнить в конце, после того как поднят Postgres (`docker compose up -d`) и есть `.env` с `DATABASE_URL`.

## 2. `packages/shared` — типы и DTO

`packages/shared/src/types/category.ts` — дополнить существующий интерфейс:

```ts
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
}
```

Новый `packages/shared/src/dto/create-category.dto.ts`:

```ts
export interface CreateCategoryDto {
  name: string;
  color: string;
  icon: string;
}
```

Новый `packages/shared/src/dto/update-category.dto.ts`:

```ts
export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  icon?: string;
}
```

Добавить экспорты в `packages/shared/src/index.ts`:
```ts
export * from "./dto/create-category.dto";
export * from "./dto/update-category.dto";
```
(`export * from "./types/category"` уже есть в файле).

`userId` в DTO не передаётся клиентом — он берётся из `@CurrentUser()` на бэкенде.

## 3. Backend — модуль `categories`

Структура по образцу `apps/backend/src/modules/users` + `dto/` по образцу `apps/backend/src/modules/auth/dto`:

```
apps/backend/src/modules/categories/
  categories.module.ts
  categories.repository.ts
  categories.service.ts
  categories.controller.ts
  dto/create-category.dto.ts
  dto/update-category.dto.ts
```

**`dto/create-category.dto.ts`** (implements shared shape + class-validator, как `register.dto.ts`):
```ts
import type { CreateCategoryDto as CreateCategoryDtoShape } from "@expense-tracker/shared";
import { IsString, MinLength } from "class-validator";

export class CreateCategoryDto implements CreateCategoryDtoShape {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  color!: string;

  @IsString()
  @MinLength(1)
  icon!: string;
}
```

**`dto/update-category.dto.ts`** — те же поля, но все `@IsOptional()`:
```ts
import type { UpdateCategoryDto as UpdateCategoryDtoShape } from "@expense-tracker/shared";
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCategoryDto implements UpdateCategoryDtoShape {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  color?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  icon?: string;
}
```

**`categories.repository.ts`** (Prisma-доступ, по образцу `users.repository.ts`), все запросы скоупятся по `userId`:
```ts
import { Injectable } from "@nestjs/common";
import { Category, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  findAllByUser(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { userId } });
  }

  findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }
}
```

**`categories.service.ts`** — бизнес-логика и проверка владения (чужую категорию нельзя ни обновить, ни удалить, ни получить):
```ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(userId: string, dto: CreateCategoryDto) {
    return this.categoriesRepository.create({
      name: dto.name,
      color: dto.color,
      icon: dto.icon,
      user: { connect: { id: userId } },
    });
  }

  findAll(userId: string) {
    return this.categoriesRepository.findAllByUser(userId);
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.getOwnedOrThrow(userId, id);
    return this.categoriesRepository.update(category.id, dto);
  }

  async remove(userId: string, id: string) {
    const category = await this.getOwnedOrThrow(userId, id);
    return this.categoriesRepository.delete(category.id);
  }

  private async getOwnedOrThrow(userId: string, id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    if (category.userId !== userId) {
      throw new ForbiddenException();
    }
    return category;
  }
}
```

**`categories.controller.ts`** — по стилю `AuthController`, весь контроллер под `JwtAuthGuard`:
```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SafeUser } from "../users/users.service";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: SafeUser) {
    return this.categoriesService.findAll(user.id);
  }

  @Patch(":id")
  update(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: SafeUser, @Param("id") id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
```

**`categories.module.ts`**:
```ts
import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesRepository } from "./categories.repository";
import { CategoriesService } from "./categories.service";

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
```

## 4. Регистрация модуля

В `apps/backend/src/app.module.ts` добавить импорт и в массив `imports`:
```ts
import { CategoriesModule } from "./modules/categories/categories.module";
...
imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, AuthModule, CategoriesModule],
```

## Проверка

1. `pnpm --filter @expense-tracker/backend prisma:generate` и `prisma:migrate` (нужен поднятый Postgres — `docker compose up -d`, `.env` с `DATABASE_URL`).
2. `pnpm --filter @expense-tracker/backend build` — убедиться, что типы сходятся (в т.ч. `@prisma/client` после generate содержит `Category`).
3. Ручная проверка через dev-сервер (`pnpm --filter @expense-tracker/backend dev`): `POST /auth/register` → `POST /auth/login` (получить JWT) → `POST /categories`, `GET /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` с `Authorization: Bearer <token>`; без токена — 401; чужой `id` в `PATCH`/`DELETE` — 403/404.

## Чеклист задач

- [x] Добавить модель `Category` и связь `categories Category[]` в `User` в `apps/backend/prisma/schema.prisma`
- [x] Дополнить `packages/shared/src/types/category.ts` полями `color`, `userId`
- [x] Создать `packages/shared/src/dto/create-category.dto.ts`
- [x] Создать `packages/shared/src/dto/update-category.dto.ts`
- [x] Добавить экспорт новых DTO в `packages/shared/src/index.ts`
- [x] Создать `apps/backend/src/modules/categories/dto/create-category.dto.ts` (class-validator)
- [x] Создать `apps/backend/src/modules/categories/dto/update-category.dto.ts` (class-validator)
- [x] Создать `apps/backend/src/modules/categories/categories.repository.ts`
- [x] Создать `apps/backend/src/modules/categories/categories.service.ts` (с проверкой владения категорией)
- [x] Создать `apps/backend/src/modules/categories/categories.controller.ts` (под `JwtAuthGuard`)
- [x] Создать `apps/backend/src/modules/categories/categories.module.ts`
- [x] Зарегистрировать `CategoriesModule` в `apps/backend/src/app.module.ts`
- [x] Выполнить `prisma:generate` и `prisma:migrate`
- [x] Прогнать `pnpm --filter @expense-tracker/backend build`
- [x] Вручную проверить все эндпоинты (auth → CRUD категорий, включая 401/403/404 кейсы)
