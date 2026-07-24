# Новая функциональность - создать модуль транзакций

## Контекст
Проект: Nest.js + Next + PostgresSQL + Prisma
Что уже есть: User, авторизация JWT, модуль категорий + frontend авторизация

# Задача
Создай TransactionsModule - центральный модуль приложения для учета доходов и расходов

## Модель данных
Добавь модель Transaction в schema.prisma:
- id
- amount
- type
- description
- date
- categoryId
- userId
- createdAt

Обнови модели User и Category - добавь обратные связи transactions Transaction[]

После изменения схемы создай и примени миграцию:
npx prisma migrate dev --name add-transactions

## Контроллер
Эндпоинты:
- POST /transactions: создать транзакцию
- GET /transactions: список с query параметрами dateForm, dateTo, type, categoryId (по пользователю)
- GET /transactions/summary: агрегация, query параметры month и year (оба обязательные)
- GET /transactions/:id одна транзакция
- PATCH /transactions/:id обновить
- DELETE /transactions/:id удалить

## Паттерн
[]

## Ограничения
- Не добавлять зависимости если не указано в задаче
- Используй class-validator для DTO
- После реализации собирай проект
