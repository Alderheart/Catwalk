# Cats domain

Everything about individual cats: their traits, personalities, ages, life stages, and how random cats are made.

## Rules
- `traits.ts` is the single source of truth for allowed genders and breeds. The database stores them as plain strings, so validation (Zod in `routes.ts`) must use these lists
- Personality is its own group of fields in its own `Personality` model (one per cat), not columns on `Cat`, so it can grow. `personality.ts` holds the allowed traits and `generatePersonality()`. The side trait always differs from the main trait
- Life stage is never stored. It is always derived from `ageMoons` with `lifeStageFor()` in `lifeStage.ts`, so the two can't disagree
- Age is measured in moons (about one month each). Stage boundaries live only in `lifeStage.ts`; don't hard-code them elsewhere
- Level is never stored either. It is derived from `xp` with `src/game/progression/level.ts`. Patrols add xp
- Gameplay stats (`health`, `maxHealth`, `energy`, `maxEnergy`, `attack`, `defense`, `speed`) are stored integers on `Cat`. `stats.ts` holds the keys, `DEFAULT_STATS` (must match the column defaults), `generateStats()` and `isStatsValid()`. Health and energy never exceed their maximums: create checks the full set, and `updateCat()` checks the merged set because a PATCH may change only one side. Nothing in play changes stats yet
- Every cat sent to the client goes through `toDto()` in `routes.ts`, which adds `lifeStage` and the level fields and nests `personality` (null for cats made before personalities existed). Every cat query lives in `service.ts` and must `include: { personality: true }`
- `generate.ts` has no database access, and takes an injectable `rng` for deterministic tests
- `GET /cats/traits` serves the allowed values for every editable field, so the admin panel's pickers never copy these lists. `PATCH /cats/:id`, and `xp` and stats on `POST /cats`, exist for the admin panel only; normal play changes xp through patrols. Stats left out of `POST /cats` are rolled

## When changing things here
- Adding a trait value: update `traits.ts`, then the matching type in `frontend/src/api/cats.ts`
- Adding a personality field: add it to the `Personality` model (not `Cat`), then `personality.ts`, `personalityBody` and `toDto()` in `routes.ts`, and `Personality` in `frontend/src/api/cats.ts`
- Adding a stored field: update `prisma/schema.prisma` (camelCase field, snake_case `@map`), run `npm run db:migrate`, then update `catFields` in `routes.ts` (used by create and update), `generateCat()` if it should be random, and `frontend/src/api/cats.ts`
- Adding a stat: add it to `STAT_KEYS` and `DEFAULT_STATS` in `stats.ts` and as a column with the same default; validation, `/cats/traits` and the admin form follow from `STAT_KEYS`. Then add it to `CatStats` in `frontend/src/api/cats.ts` and a label in `CatForm.tsx`
- Changing stage boundaries: edit the constants in `lifeStage.ts` only; `AGE_RANGES` follows from them
