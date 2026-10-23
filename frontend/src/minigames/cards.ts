// Every minigame card in the game. Features don't play these directly; they
// list the ones that are valid for them in a deck (see patrols/patrolDeck.ts).

import { HITS_TO_WIN, PounceGame } from './pounce/PounceGame.tsx'
import type { MinigameCard } from './types.ts'

export const pounceCard: MinigameCard = {
	key: 'pounce',
	name: 'Pounce!',
	howToPlay: `Tap the mouse ${HITS_TO_WIN} times before time runs out.`,
	wonText: 'Caught it!',
	lostText: 'It got away.',
	Game: PounceGame,
}

// Every card, in the order the admin panel lists them. Add new cards here too,
// so they can be launched on their own for testing
export const ALL_CARDS: readonly MinigameCard[] = [pounceCard]
