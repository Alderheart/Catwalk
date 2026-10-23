// Life stage is derived from age in moons (one moon is about one month).

export const LIFE_STAGES = ['kit', 'adolescent', 'adult', 'elder'] as const
export type LifeStage = (typeof LIFE_STAGES)[number]

// The first moon of each stage after kit
export const ADOLESCENT_AT = 6
export const ADULT_AT = 12
export const ELDER_AT = 120

export function lifeStageFor(ageMoons: number): LifeStage {
	if (ageMoons < ADOLESCENT_AT) return 'kit'
	if (ageMoons < ADULT_AT) return 'adolescent'
	if (ageMoons < ELDER_AT) return 'adult'
	return 'elder'
}

// Inclusive age range for each stage, used when generating a cat of a given stage
export const AGE_RANGES: Record<LifeStage, [min: number, max: number]> = {
	kit: [0, ADOLESCENT_AT - 1],
	adolescent: [ADOLESCENT_AT, ADULT_AT - 1],
	adult: [ADULT_AT, ELDER_AT - 1],
	elder: [ELDER_AT, 180],
}
