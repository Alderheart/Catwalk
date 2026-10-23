# Backend

Node + Express 5 + TypeScript, Prisma 7 on SQLite (via the better-sqlite3 adapter), Zod for validation.

## Scripts
- `npm run dev`: run with reload on http://localhost:3000
- `npm run typecheck`: type check without building
- `npm run db:migrate`: create and apply a migration after editing `prisma/schema.prisma`
- `npm run db:studio`: browse the database

## Layout
Folders follow `docs/decisions/0008-folder-layout.md`.
- `src/index.ts`: loads env and starts the server on `HOST`/`PORT`. Nothing else. Production binds `127.0.0.1` behind Caddy (see `docs/deploy.md`)
- `src/app.ts`: builds the Express app and mounts routers under `/api`
- `src/platform/`: plumbing with no game rules. `db.ts` is the only file that knows which database driver we use; `players/current.ts` says who the request is for (one implicit player, see `docs/decisions/0006-single-implicit-player.md`)
- `src/game/<domain>/`: one folder per game domain (`cats/`, `patrols/`, `inventory/`, `camp/`, `progression/`), named like its frontend `api/` file
- `src/generated/prisma/`: generated Prisma client. Never edit; regenerate with `npm run db:generate`

### Files in a domain folder
- `routes.ts`: HTTP only. Validate with Zod, call the service, return a DTO. No Prisma calls and no dice rolls
- `service.ts`: database reads, writes and transactions. No Express `req`/`res`; expected failures are thrown as errors that carry a status
- `<rule>.ts` (like `generate.ts`, `hunting.ts`, `timing.ts`): pure game rules with no database access
- `types.ts`: allowed values and shared types, when the domain has them
- `CLAUDE.md`: only when the domain has rules that aren't obvious from the code

Domains may import each other's rule files and types. Only a service writes tables, and a service writes another domain's tables only inside a transaction it owns, noted in its `CLAUDE.md` (patrols collect does this).

## Patterns
- Imports use explicit `.ts` extensions (`nodenext` + `rewriteRelativeImportExtensions`)
- Validate every request body with Zod `safeParse`, and return `400` with `z.prettifyError` on failure
- Route handlers return a DTO, not the raw Prisma row, so derived fields stay in one place
- Keep game rules (random rolls, rewards, currency) on the server; the client only asks for them
- Keep logic that doesn't need the database in plain rule files (like `game/cats/generate.ts`) so it can be tested without one
- Random generators take an injectable `rng` so tests can be deterministic

## Schema rules
- Keep types portable (String, Int, Boolean, DateTime, Float), use string `cuid()` ids, and avoid raw SQL, so moving to Postgres is a provider swap (see the root `README.md`)
- Enum-like values are stored as strings and validated in code, because SQLite has no enums
- Don't store values that can be derived (for example life stage from age, or level from xp)
