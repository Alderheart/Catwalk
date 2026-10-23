# 0007 Minigames are cards played from a deck

Status: Accepted

## Context
Minigames started as a single pounce game that sped up hunting patrols. More minigames and more places to play them are coming, and each one invented its own flow would drift.

## Decision
Every minigame is a card, and every feature plays them through one flow in `frontend/src/minigames/MinigameSession.tsx`: the feature's list of valid cards is shuffled into a deck, a hand of X cards is drawn, and the cards are played one at a time, each as its own minigame. Features configure the deck and hand size; they don't build their own flow.

The shuffle and draw happen on the client. Which minigames come up is not an outcome, and the backend still decides what wins are worth. The client reports a hand's wins in one call, because a hand is played faster than a per-win cooldown would allow.

## Consequences
- A new minigame is one component plus one entry in `cards.ts`, and works anywhere a deck lists it
- A new place to play minigames is a deck and a hand size
- The client can redraw by leaving and starting again. That's harmless while every card is worth the same. If cards start carrying different rewards, move the draw to the backend and store the hand, so it can't be rerolled
