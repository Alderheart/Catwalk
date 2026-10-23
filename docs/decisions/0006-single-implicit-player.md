# 0006 One implicit player until accounts exist

Status: Accepted

## Context
Patrols added things that belong to the player (an inventory, a camp with its own xp), but the game has no accounts or sessions yet.

## Decision
Every request belongs to a single player with the username `player`, created on first use by `getCurrentPlayer()` in `backend/src/platform/players/current.ts`. Player-owned data (camp, inventory, patrols) is still stored with a `playerId`, so it is ready for more than one player. Cats are not linked to a player yet.

## Consequences
- Anyone who can reach the server plays the same save
- Adding accounts means teaching `getCurrentPlayer()` about sessions, and giving cats a `playerId`
- Routes must get the player from `getCurrentPlayer()`, never from the request body
