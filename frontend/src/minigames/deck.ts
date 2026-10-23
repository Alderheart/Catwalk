// Building, shuffling and drawing a deck of minigame cards. Plain functions
// with an injectable rng so they can be tested without React.
//
// Drawing which minigames to play is not a game outcome, so it happens here on
// the client. What a win is worth is still decided by the backend.

import type { DeckEntry, MinigameCard } from './types.ts'

export function buildDeck(entries: readonly DeckEntry[]): MinigameCard[] {
	return entries.flatMap(({ card, copies }) => Array.from({ length: copies }, () => card))
}

// Fisher-Yates, returning a new array
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
	const out = [...items]
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		;[out[i], out[j]] = [out[j], out[i]]
	}
	return out
}

// A hand never holds more cards than the deck does
export function drawHand(
	entries: readonly DeckEntry[],
	handSize: number,
	rng: () => number = Math.random,
): MinigameCard[] {
	return shuffle(buildDeck(entries), rng).slice(0, Math.max(0, handSize))
}
