# Backend

Node + Express 5 + TypeScript, Prisma 7 on SQLite (via the better-sqlite3 adapter), Zod for validation.

## Scripts
- `npm run dev`: run with reload on http://localhost:3000
- `npm run typecheck`: type check without building
- `npm run db:migrate`: create and apply a migration after editing `prisma/schema.prisma`
- `npm run db:studio`: browse the database

## Layout
- `src/index.ts`: loads env and starts the server. Nothing else
- `src/app.ts`: builds the Express app and mounts routers under `/api`
- `src/db.ts`: the only file that knows which database driver we use
- `src/<domain>/`: one folder per game domain (e.g. `cats/`) holding its routes, rules and generators
- `src/generated/prisma/`: generated Prisma client. Never edit; regenerate with `npm run db:generate`

## Patterns
- Imports use explicit `.ts` extensions (`nodenext` + `rewriteRelativeImportExtensions`)
- Validate every request body with Zod `safeParse`, and return `400` with `z.prettifyError` on failure
- Route handlers return a DTO, not the raw Prisma row, so derived fields stay in one place
- Keep game rules (random rolls, rewards, currency) on the server; the client only asks for them
- Keep logic that doesn't need the database in plain functions (like `cats/generate.ts`) so it can be tested without one
- Random generators take an injectable `rng` so tests can be deterministic

## Schema rules
- Keep types portable (String, Int, Boolean, DateTime, Float), use string `cuid()` ids, and avoid raw SQL, so moving to Postgres is a provider swap (see the root `README.md`)
- Enum-like values are stored as strings and validated in code, because SQLite has no enums
- Don't store values that can be derived (for example life stage from age)
