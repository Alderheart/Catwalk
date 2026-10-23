// Finds the player making a request. There are no accounts yet, so every
// request belongs to one implicit player (see docs/decisions/0006). When
// accounts arrive, only this file should need to learn about sessions.

import { prisma } from '../db.ts'

const DEFAULT_USERNAME = 'player'

// Creates the player and their camp on first use, so a fresh database works
// without a seed step
export async function getCurrentPlayer() {
	return prisma.player.upsert({
		where: { username: DEFAULT_USERNAME },
		update: {},
		create: { username: DEFAULT_USERNAME, camp: { create: {} } },
	})
}
