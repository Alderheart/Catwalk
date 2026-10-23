// The shapes every minigame card and deck share. A card is one self-contained
// minigame; MinigameSession.tsx owns the flow around it (shuffle, draw, play
// one at a time), so a card never knows which deck or feature it was drawn for.

import type { ComponentType } from 'react'

export type MinigameProps = {
	// Call exactly once, when the round is over. The session moves on from there
	onFinish: (won: boolean) => void
}

export type MinigameCard = {
	// Stable id, safe to log or send to the backend later
	key: string
	name: string
	// One line shown before the card is played, telling the player what to do
	howToPlay: string
	wonText: string
	lostText: string
	Game: ComponentType<MinigameProps>
}

// The valid cards for one feature, and how many copies of each go in its deck.
// More copies make a card more likely to be drawn, and let a hand hold it twice
export type DeckEntry = { card: MinigameCard; copies: number }

export type CardResult = { card: MinigameCard; won: boolean }
