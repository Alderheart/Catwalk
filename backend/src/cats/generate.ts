// Rolls random cats. Pure logic with no database access, so it can be tested
// on its own; routes.ts saves the result.

import { AGE_RANGES, LIFE_STAGES, type LifeStage } from './lifeStage.ts'
import { BREEDS, GENDERS, type Breed, type Gender } from './traits.ts'

export type CatTraits = {
	name: string
	breed: Breed
	gender: Gender
	ageMoons: number
}

const NAMES = [
	'Ash', 'Bramble', 'Cinder', 'Dapple', 'Ember', 'Fern', 'Frost', 'Hazel',
	'Juniper', 'Lark', 'Maple', 'Moss', 'Nettle', 'Pebble', 'Quill', 'Rowan',
	'Sage', 'Sorrel', 'Thistle', 'Willow', 'Wren', 'Birch', 'Clover', 'Flint',
]

// Random source is injectable so tests and seeded runs can be deterministic
export type Rng = () => number

function pick<T>(items: readonly T[], rng: Rng): T {
	return items[Math.floor(rng() * items.length)]
}

function randomInt(min: number, max: number, rng: Rng): number {
	return min + Math.floor(rng() * (max - min + 1))
}

export function generateCat(options: { lifeStage?: LifeStage; rng?: Rng } = {}): CatTraits {
	const rng = options.rng ?? Math.random
	const lifeStage = options.lifeStage ?? pick(LIFE_STAGES, rng)
	const [minAge, maxAge] = AGE_RANGES[lifeStage]
	return {
		name: pick(NAMES, rng),
		breed: pick(BREEDS, rng),
		gender: pick(GENDERS, rng),
		ageMoons: randomInt(minAge, maxAge, rng),
	}
}
