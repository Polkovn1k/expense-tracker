# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Dependencies are installed (`node_modules` + `pnpm-lock.yaml` present). Backend has working `auth` (register/login/me via JWT), `users`, and `categories` modules on top of Prisma. Frontend has working login/register pages built on shadcn/ui, structured with Feature-Sliced Design (see below).

**Environment note:** this repo lives on a WSL filesystem path. Running `pnpm`/`node` from a Windows-side shell against the `wsl.localhost...` UNC path breaks (cmd.exe can't `chdir` into a UNC path, subprocesses spawned by pnpm fail with `EPERM` writes to `C:Windows`). Always run installs/dev servers/builds through a real WSL shell (`wsl.exe -e bash -lc "..."`), not directly against the UNC path. Node is managed via `nvm` inside WSL (`nvm use 24`); pnpm is enabled via `corepack`.

## Stack

-   **Monorepo orchestration:** Turborepo (`turbo.json`)
-   **Workspaces / package manager:** pnpm (`pnpm-workspace.yaml`) — this repo uses pnpm, not npm/yarn
-   **Frontend:** `apps/frontend` — Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (Radix-based, style `radix-nova`), structured with **Feature-Sliced Design** (see below)
-   **Backend:** `apps/backend` — NestJS, TypeScript
-   **Database / ORM:** PostgreSQL + Prisma, schema at `apps/backend/prisma/schema.prisma`
-   **Shared package:** `packages/shared` (`@expense-tracker/shared`) — types and DTOs consumed by both frontend and backend (e.g. `Expense`, `Category`, `CreateExpenseDto`, `UpdateExpenseDto`, `AuthUser`, `LoginDto`, `RegisterDto`), exported via `packages/shared/src/index.ts`

## Commands

```bash
# install all workspace dependencies (run this first)
pnpm install

# run frontend + backend dev servers together (via turbo)
pnpm dev

# build all packages (turbo resolves build order: shared before frontend/backend)
pnpm build

# lint all packages
pnpm lint

# run a single app only, use pnpm --filter
pnpm --filter @expense-tracker/backend dev
pnpm --filter @expense-tracker/frontend dev

# Prisma (run from backend package or via --filter)
pnpm --filter @expense-tracker/backend prisma:generate
pnpm --filter @expense-tracker/backend prisma:migrate

# local Postgres via docker-compose
docker compose up -d
```

Copy `.env.example` to `.env` in `apps/backend` and `apps/frontend` before running either app.

## Running the project (from scratch)

Run everything through a real WSL shell, not a Windows-side shell against the UNC path (see environment note above).

```bash
# 1. one-time env setup
wsl.exe -e bash -lc "cd ~/projects/ai-projects/test-1 && cp apps/backend/.env.example apps/backend/.env && cp apps/frontend/.env.example apps/frontend/.env"

# 2. start local Postgres
wsl.exe -e bash -lc "cd ~/projects/ai-projects/test-1 && docker compose up -d"

# 3. start frontend + backend together (turbo)
wsl.exe -e bash -lc "source ~/.nvm/nvm.sh && nvm use 24 && cd ~/projects/ai-projects/test-1 && pnpm dev"
```

-   Frontend: [http://localhost:3000](http://localhost:3000)
-   Backend: [http://localhost:3001](http://localhost:3001)

If step 3 fails with `EADDRINUSE` on port 3001, a backend instance from a previous session is likely still running in the background — check with `wsl.exe -e bash -lc "ss -ltnp | grep 3001"` before starting a new one.

## Architecture notes

-   **Build/task order is defined in `turbo.json`**: `build` for frontend/backend depends on `^build` (i.e. `packages/shared` must build first). When adding new tasks that depend on shared code, wire them through `turbo.json` rather than ad-hoc scripts.
-   **`packages/shared` is types/DTOs only** — no business logic, no Prisma client, no framework-specific code (no React components, no NestJS modules). It exists so `Expense`/`Category`/DTO shapes are defined once and imported by both apps (`@expense-tracker/shared`).
-   **Frontend consumes the shared package as source**, not a built artifact: `apps/frontend/next.config.mjs` sets `transpilePackages: ["@expense-tracker/shared"]` so Next.js transpiles it directly from `packages/shared/src` — no separate build step needed for local dev. (It's `.mjs`, not `.ts` — this Next.js 14.2.x version doesn't support `next.config.ts`.)
-   **Backend consumes Prisma directly**: the Prisma schema lives under `apps/backend/prisma/schema.prisma`, scoped to the backend app, not shared.
-   **Backend CORS**: `apps/backend/src/main.ts` calls `app.enableCors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" })` so the frontend (port 3000) can call the API (port 3001) from the browser. Set `CORS_ORIGIN` in `apps/backend/.env` for non-default setups.
-   **TypeScript configs form a hierarchy**: `tsconfig.base.json` at the repo root holds shared compiler options; each package/app's `tsconfig.json` extends it and overrides only what differs (e.g. backend uses CommonJS + decorators for NestJS, frontend uses bundler resolution + JSX preserve for Next.js).
-   **Swagger docs must stay in sync with the backend API**: the backend has `@nestjs/swagger` wired up (`apps/backend/src/main.ts`, served at `/api/docs`). Every controller endpoint uses `@ApiTags`/`@ApiBearerAuth`/`@ApiOperation`/`@ApiResponse`/`@ApiParam`, and every DTO field uses `@ApiProperty`/`@ApiPropertyOptional`. Whenever you add, remove, or change a backend endpoint or DTO (new route, changed params/body/response shape, new status code), update the corresponding Swagger decorators in the same change — don't let the docs drift from the code.

## Commit conventions

This repo follows [Conventional Commits](https://www.conventionalcommits.org/). Format: `<type>[optional scope]: <description>`, e.g. `feat(auth): add JWT refresh endpoint`, `fix(frontend): forwardRef missing on Input`. Common types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `build`, `ci`. A `!` after the type/scope (or a `BREAKING CHANGE:` footer) marks a breaking change.

## Frontend architecture: Feature-Sliced Design

`apps/frontend/src` follows FSD. Next.js's App Router (`src/app`) is used only for routing — pages stay thin and import UI from lower layers. Import direction is one-way: `app` → `features` → `entities` → `shared` (a layer may only import from layers below it).

-   **`app/`** — Next.js routes only (`layout.tsx`, `page.tsx`, route groups like `(auth)/login`, `(auth)/register`). A page component composes a feature and renders it; no business logic here.
-   **`features/`** — one folder per user-facing action, e.g. `features/auth/login`, `features/auth/register`. Each feature slice has its own `api/` (backend calls), `model/` (a hook with the form/schema/submit logic — e.g. `useLoginForm`), and `ui/` (the React component), re-exported through the slice's `index.ts`. Import a feature only via its `index.ts`, never reach into `ui/`, `model/`, or `api/` directly from outside the slice.
-   **`entities/`** — domain objects shared across features, e.g. `entities/user` (the `AuthUser` type) and `entities/session` (localStorage-backed session read/write: `saveSession`/`getSession`/`clearSession`). No UI here, just types and framework-agnostic logic.
-   **`shared/`** — reusable, feature-agnostic code: `shared/ui` (shadcn/ui components — button, input, label, card, etc.), `shared/lib` (`cn()` helper), `shared/api` (`apiClient`/`ApiError`, a thin fetch wrapper pointed at `NEXT_PUBLIC_API_URL`), `shared/config` (env access).
-   **shadcn/ui aliases are remapped for FSD**: `apps/frontend/components.json` points `components`/`ui` at `@/shared/ui` and `utils`/`lib` at `@/shared/lib` (not the default `@/components`, `@/lib`). Run `pnpm dlx shadcn@latest add <component>` from `apps/frontend` to add new components — they'll land in `shared/ui` automatically.
-   **shadcn-generated components need a `forwardRef` check**: this shadcn CLI version (`radix-nova` style) generates components assuming React 19's ref-as-prop, but this project pins React 18.3. Any generated component that needs to receive a `ref` (e.g. `Input`, for `react-hook-form`'s `register()`) must be wrapped in `React.forwardRef` manually — the CLI won't do it. Symptom if missed: silent form-state bugs (RHF can't reach the DOM node) rather than a build error, plus a console warning ("Function components cannot be given refs").
-   **Auth session persistence**: no server sessions/cookies — the backend issues a JWT, which the frontend stores (alongside the user object) in `localStorage` via `entities/session`. There's no global auth context/provider yet; that would be the next thing to add if more pages need to read "am I logged in" reactively.
