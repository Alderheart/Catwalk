// Rolls what a hunting patrol brings back. Pure logic with no database access
// and an injectable rng, so it can be tested on its own; service.ts applies it.

import type { Rng } from '../cats/generate.ts'
import type { ItemKey } from '../inventory/items.ts'
import type { PatrolRole } from './types.ts'

export type HuntingCat = { catId: string; role: PatrolRole; level: number }

export type HuntingOutcome = {
	items: Partial<Record<ItemKey, number>>
	cats: { catId: string; caught: number; xp: number }[]
	campXp: number
}

// Weighted so small prey is common and big prey is rare
const PREY: [ItemKey, number][] = [
	['mouse', 40],
	['vole', 25],
	['sparrow', 15],
	['squirrel', 12],
	['rabbit', 8],
]
const PREY_WEIGHT = PREY.reduce((sum, [, weight]) => sum + weight, 0)

// The leader gets an extra try at prey and extra xp for leading
const ATTEMPTS: Record<PatrolRole, number> = { leader: 3, member: 2 }
const BASE_XP: Record<PatrolRole, number> = { leader: 30, member: 20 }
const XP_PER_CATCH = 5
const CAMP_BASE_XP = 10
const CAMP_XP_PER_CATCH = 3

// Higher level cats catch more often, up to a cap
function catchChance(level: number): number {
	return Math.min(0.35 + 0.05 * (level - 1), 0.75)
}

function pickPrey(rng: Rng): ItemKey {
	let roll = rng() * PREY_WEIGHT
	for (const [key, weight] of PREY) {
		roll -= weight
		if (roll < 0) return key
	}
	return PREY[0][0]
}

export function rollHunting(cats: HuntingCat[], rng: Rng = Math.random): HuntingOutcome {
	const items: Partial<Record<ItemKey, number>> = {}
	let totalCaught = 0
	const catResults = cats.map(({ catId, role, level }) => {
		let caught = 0
		for (let i = 0; i < ATTEMPTS[role]; i++) {
			if (rng() < catchChance(level)) {
				const prey = pickPrey(rng)
				items[prey] = (items[prey] ?? 0) + 1
				caught++
			}
		}
		totalCaught += caught
		return { catId, caught, xp: BASE_XP[role] + XP_PER_CATCH * caught }
	})
	return { items, cats: catResults, campXp: CAMP_BASE_XP + CAMP_XP_PER_CATCH * totalCaught }
}
