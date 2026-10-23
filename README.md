# Clangen

A small prototype game about managing cats in a colony. Built with React and Prisma ORM.

## Layout

- `frontend/`: Vite + React + TypeScript, Tailwind for UI, PixiJS for game scenes
- `backend/`: Node + Express + TypeScript, Prisma ORM on SQLite for now

Each folder has its own `node_modules`; nothing is shared.

## Running locally

```sh
# Terminal 1: backend on http://localhost:3000
cd backend
cp .env.example .env
npm install           # also generates the Prisma client
npm run db:migrate    # creates backend/dev.db
npm run dev

# Terminal 2: frontend on http://localhost:5173
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api/*` to the backend, and listens on your LAN so you can open it on a phone using the "Network" URL Vite prints.

## Deploying

See [docs/deploy.md](docs/deploy.md) for running it on a VPS behind Caddy with HTTPS.

## Database

The game talks to the backend over HTTP, and only the backend touches the database. That keeps things like gacha pulls and currency on the server where players can't edit them.

Naming: Prisma models and fields are camelCase in code, mapped to snake_case tables and columns with `@map` / `@@map`.

### Moving from SQLite to Postgres later

1. In `backend/prisma/schema.prisma`, change `provider = "sqlite"` to `"postgresql"`.
2. In `backend/src/db.ts`, swap `@prisma/adapter-better-sqlite3` for `@prisma/adapter-pg`.
3. Point `DATABASE_URL` at the hosted database (Supabase, Neon, etc.).
4. Delete `backend/prisma/migrations/` and run `npm run db:migrate -- --name init` once. SQLite migrations are SQL for SQLite and won't run on Postgres, so the history restarts.

Any data in `dev.db` would need a one-off copy script. Until then, keep the schema to portable types (String, Int, Boolean, DateTime, Float) and avoid raw SQL.
