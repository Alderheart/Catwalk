// A cat's personality: its own group of fields, stored in a separate table so
// it can grow (more traits, facets, quirks) without widening the cat itself.
// The trait list is the source of truth for validation, because the database
// stores traits as plain strings.

import type { Rng } from './generate.ts'

// Kept deliberately short so each trait can have a real effect on gameplay.
// Add a trait only alongside the rules that make it matter
export const PERSONALITY_TRAITS = ['bold', 'timid', 'loyal'] as const
export type PersonalityTrait = (typeof PERSONALITY_TRAITS)[number]

export type Personality = {
	mainTrait: PersonalityTrait
	sideTrait: PersonalityTrait
}

// The side trait is always different from the main one, so a cat never reads
// as "bold, and also bold"
export function generatePersonality(rng: Rng = Math.random): Personality {
	const mainIndex = Math.floor(rng() * PERSONALITY_TRAITS.length)
	// Pick from the other traits by skipping over the main one
	let sideIndex = Math.floor(rng() * (PERSONALITY_TRAITS.length - 1))
	if (sideIndex >= mainIndex) sideIndex++
	return { mainTrait: PERSONALITY_TRAITS[mainIndex], sideTrait: PERSONALITY_TRAITS[sideIndex] }
}
