# Patrols domain

Sending groups of cats out of camp on patrols, and what comes back. Only scaffolding exists so far; the gameplay is still being designed.

## Current state
- `types.ts`: placeholder shapes. `PATROL_TYPES` is borrowed from ClanGen and is not a decision
- `routes.ts`: `GET /api/patrols` returns an empty list, `POST /api/patrols` returns `501`
- Nothing is stored. There is no Prisma model yet

## Rules
- Patrol outcomes (success, prey, injuries, relationships, anything random) are rolled here on the server, never on the client (see `docs/decisions/0001-server-authoritative-state.md`)
- Keep outcome logic in plain functions with an injectable `rng`, like `cats/generate.ts`, so it can be tested without a database
- Refer to cats by id. Don't copy cat fields into patrol records, and don't change the cat model from here; that belongs to `cats/`

## When building this out
- Adding a stored patrol: add a Prisma model (camelCase fields, snake_case `@map`), run `npm run db:migrate`, validate input with Zod in `routes.ts`, and return a DTO
- Changing a response shape: update `frontend/src/api/patrols.ts` in the same PR
- Replace "Current state" above with the real rules once patrols are designed
