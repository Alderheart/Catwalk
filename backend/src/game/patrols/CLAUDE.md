# Patrols domain

Sending groups of cats out of camp, in real time, and what they bring back. Only hunting patrols exist so far.

## How a patrol works
- A patrol has one leader and up to three members (`MAX_PATROL_MEMBERS` in `types.ts`). Kits can't go, and a cat can be on only one active patrol
- It runs for `PATROL_DURATION_MS` (`timing.ts`, 30 minutes, or `HUNTING_PATROL_MINUTES` from the env for testing)
- The player speeds a patrol up by playing a hand of minigame cards (`frontend/src/minigames/`). When the hand is over the client calls `POST /:id/boost` once with `{ wins }`, and each win takes a sixth of the full duration off. At most `MAX_BOOSTS` per patrol, and boost calls at least `BOOST_COOLDOWN_MS` apart
- Once `endsAt` passes, `POST /:id/collect` rolls the rewards and marks it `completed`. Rewards are cat xp, camp xp, and prey added to the player's inventory

## Rules
- Outcomes are rolled here on the server, at collect time, never on the client (see `docs/decisions/0001-server-authoritative-state.md`). Nothing about the outcome is stored while a patrol is out
- Minigame wins are reported by the client and can't be verified. The boost cap and cooldown are what bound cheating, so keep them when changing boosts
- Outcome rolls are plain functions with an injectable `rng` (`hunting.ts`), with no database access
- `service.ts` holds the transactions; `routes.ts` only validates, calls it and builds the DTO
- Collect is the one place that writes other domains' tables (cat xp, camp xp, inventory), all in one transaction so a payout is all or nothing
- Collect flips `status` with a guarded `updateMany` inside the transaction so two collects can't both pay out
- Patrols refer to cats by id (`PatrolMember`). Cat xp is the only cat field changed here
- Every query is scoped to `getCurrentPlayer()` (`src/platform/players/current.ts`)

## When changing things here
- Adding a patrol type: add it to `PATROL_TYPES`, write its roller next to `hunting.ts`, pick the roller in `collectPatrol()` in `service.ts`, and update `frontend/src/api/patrols.ts`
- Tuning rewards: constants at the top of `hunting.ts`. Tuning time: `timing.ts`
- Changing a response shape: update `frontend/src/api/patrols.ts` in the same PR
