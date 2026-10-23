# Cats domain

Everything about individual cats: their traits, ages, life stages, and how random cats are made.

## Rules
- `traits.ts` is the single source of truth for allowed genders and breeds. The database stores them as plain strings, so validation (Zod in `routes.ts`) must use these lists
- Life stage is never stored. It is always derived from `ageMoons` with `lifeStageFor()` in `lifeStage.ts`, so the two can't disagree
- Age is measured in moons (about one month each). Stage boundaries live only in `lifeStage.ts`; don't hard-code them elsewhere
- Every cat sent to the client goes through `toDto()` in `routes.ts`, which adds `lifeStage`
- `generate.ts` has no database access, and takes an injectable `rng` for deterministic tests

## When changing things here
- Adding a trait value: update `traits.ts`, then the matching type in `frontend/src/api/cats.ts`
- Adding a stored field: update `prisma/schema.prisma` (camelCase field, snake_case `@map`), run `npm run db:migrate`, then update `createCatBody` in `routes.ts`, `generateCat()` if it should be random, and `frontend/src/api/cats.ts`
- Changing stage boundaries: edit the constants in `lifeStage.ts` only; `AGE_RANGES` follows from them
