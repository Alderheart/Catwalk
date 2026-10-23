# Minigames

Every minigame is a card, and every feature plays them the same way (see `docs/decisions/0007-minigame-card-decks.md`):

1. The feature lists the cards that are valid for it in a deck (`DeckEntry[]`, with copies per card)
2. `MinigameSession` shuffles that deck and draws a hand of `handSize` cards (`deck.ts`)
3. The cards are played one at a time, each as its own minigame
4. When the hand is over, or the player leaves early, `onEnd` gets a won/lost result per card played

## Layout
- `types.ts`: `MinigameCard`, `MinigameProps`, `DeckEntry`, `CardResult`
- `deck.ts`: building, shuffling and drawing, as plain functions with an injectable `rng`
- `MinigameSession.tsx`: the only place the flow lives. Header, hand strip, ready/result/summary screens
- `cards.ts`: every card in the game
- `<card>/`: one folder per card, holding its React component and Pixi scene (`pounce/` is the reference)

## Rules
- A card's `Game` fills the space it's given, calls `onFinish(won)` exactly once, and knows nothing about decks, other cards, or rewards
- Don't add a different flow for one feature. Configure it through the deck and hand size instead, or extend `MinigameSession` for everyone
- Decks live with the feature that plays them (for example `src/patrols/patrolDeck.ts`), not here
- The client only reports results. What a win is worth is decided by the backend, which can't verify wins, so it caps them (see `backend/src/patrols/timing.ts`)

## Adding a card
Make `<card>/<Name>Game.tsx` taking `MinigameProps` (plus a Pixi scene if it needs one, via `usePixiApp`), add a `MinigameCard` to `cards.ts`, and put it in the decks where it is valid.
