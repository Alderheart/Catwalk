// A cat's gameplay stats: health and energy pools with their maximums, and
// attack, defense and speed. Pure rules with no database access. Current health
// and energy can never go above their maximums; isStatsValid() is the one check
// routes and the service both use.

import type { Rng } from './generate.ts'

export const STAT_KEYS = ['health', 'maxHealth', 'energy', 'maxEnergy', 'attack', 'defense', 'speed'] as const
export type StatKey = (typeof STAT_KEYS)[number]
export type CatStats = Record<StatKey, number>

// Upper bound for any single stat, so admin edits can't store absurd numbers
export const MAX_STAT = 9999

// What a cat made before stats existed gets. Must match the column defaults in
// prisma/schema.prisma
export const DEFAULT_STATS: CatStats = {
	health: 100,
	maxHealth: 100,
	energy: 100,
	maxEnergy: 100,
	attack: 10,
	defense: 10,
	speed: 10,
}

// Combat stats roll around the default so new cats differ a little. Pools start
// full. Nothing scales with life stage or level yet; add that alongside the
// rules that use these stats
const COMBAT_ROLL: [min: number, max: number] = [6, 14]

export function generateStats(rng: Rng = Math.random): CatStats {
	const [min, max] = COMBAT_ROLL
	const roll = () => min + Math.floor(rng() * (max - min + 1))
	return { ...DEFAULT_STATS, attack: roll(), defense: roll(), speed: roll() }
}

export const STATS_RULE = 'health must not exceed maxHealth, and energy must not exceed maxEnergy'

export function isStatsValid(stats: Pick<CatStats, 'health' | 'maxHealth' | 'energy' | 'maxEnergy'>): boolean {
	return stats.health <= stats.maxHealth && stats.energy <= stats.maxEnergy
}
