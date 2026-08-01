---
name: write-test
description: Написать unit-тесты (Vitest + Testing Library) для React-компонента фронтенда по переданному пути к файлу. Используй, когда пользователь просит написать/добавить тесты на конкретный компонент, например "/write-test apps/frontend/src/shared/ui/button.tsx".
argument-hint: [component-path]
arguments: [component_path]
model: sonnet
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /write-test $component_path

Пишет тесты для одного React-компонента: `apps/frontend`, Vitest + React Testing Library.

Компонент: `$component_path`

Если `$component_path` пуст или файла по этому пути не существует — спроси у пользователя точный путь, не угадывай.

## Порядок действий

1. **Прочитай компонент** `$component_path`: пропсы, условный рендеринг, обработчики событий, зависимости (хуки, импорты из `entities`/`shared`/`features`).

2. **Проверь, настроен ли Vitest** в `apps/frontend`:
   - `apps/frontend/package.json` — есть ли `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` в devDependencies, и есть ли скрипт `test`.
   - Наличие `apps/frontend/vitest.config.ts` (или секции `test` в `vite.config.ts`) и setup-файла (например `vitest.setup.ts`, подключающего `@testing-library/jest-dom`).

   Если стенд ещё не настроен — сначала подними его (один раз для всего фронтенда):
   - Установи зависимости: `pnpm --filter @expense-tracker/frontend add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`.
   - Создай `apps/frontend/vitest.config.ts` с `environment: "jsdom"`, алиасом `@` на `src` (как в `tsconfig.json`) и `setupFiles`.
   - Создай `apps/frontend/vitest.setup.ts` с `import "@testing-library/jest-dom"`.
   - Добавь скрипт `"test": "vitest run"` в `apps/frontend/package.json`.
   - Не трогай `turbo.json`/backend — задача касается только фронтенд-тестов.

3. **Определи путь тестового файла**: колоцируй тест рядом с компонентом как `<имя-компонента>.test.tsx` (следуя FSD-структуре слайса — тест лежит в том же слайсе/папке `ui/`, что и сам компонент, не выноси в отдельный `__tests__`).

4. **Напиши тесты**, покрывающие:
   - базовый рендер (компонент монтируется без ошибок, дефолтные пропсы дают ожидаемый DOM);
   - варианты пропсов, которые меняют рендер или поведение (variant/size/disabled/error-состояния и т.п.);
   - пользовательские взаимодействия через `@testing-library/user-event` (клик, ввод текста, submit) с проверкой вызова колбэков (`vi.fn()`);
   - edge cases, специфичные для этого компонента (пустые значения, длинные строки, ошибочные состояния формы), но не выдумывай сценарии, которых нет в реализации.
   - Если компонент собран через `React.forwardRef` — не нужен отдельный тест на forwardRef ради самого форварда; тестируй только наблюдаемое поведение.

5. **Прогони тест** — `pnpm --filter @expense-tracker/frontend test -- <путь до .test.tsx>` — и убедись, что он проходит. Почини тест, если он падает по твоей ошибке (не подгоняй сам компонент под тест, если только в компоненте не найден реальный баг — в этом случае сообщи об этом пользователю отдельно, не исправляй его тайно).

## Важно

- Не пиши тесты на сторонние библиотеки (Radix, shadcn-примитивы) — тестируй только логику и разметку, которые добавил сам компонент.
- Не создавай моки там, где можно отрендерить компонент как есть (реальные дочерние shadcn/ui-компоненты рендерить напрямую, не мокать).
- Следуй существующему стилю тестов в репозитории, если к моменту вызова skill'а такие тесты уже появились — не изобретай новый стиль на каждый вызов.
