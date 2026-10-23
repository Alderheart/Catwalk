// Which minigame cards a patrol can draw, and how many. The flow itself lives
// in minigames/MinigameSession.tsx; this only configures it for patrols.

import type { Patrol } from '../../api/patrols.ts'
import { pounceCard } from '../../minigames/cards.ts'
import type { DeckEntry } from '../../minigames/types.ts'

export const huntingDeck: DeckEntry[] = [{ card: pounceCard, copies: 3 }]

const HAND_SIZE = 3

// Never more cards than boosts left, so every card in the hand can still pay off
export function patrolHandSize(patrol: Patrol): number {
	return Math.min(HAND_SIZE, patrol.boostsLeft)
}
