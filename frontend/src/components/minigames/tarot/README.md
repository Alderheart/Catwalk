# Tarot Card Minigames

This directory contains minigames for each tarot card, organized by card name and orientation.

## Structure

```
tarot/
├── the-fool/
│   ├── UprightMinigame.tsx
│   └── ReversedMinigame.tsx
├── the-magician/
│   ├── UprightMinigame.tsx
│   └── ReversedMinigame.tsx
├── the-hermit/
│   ├── UprightMinigame.tsx
│   └── ReversedMinigame.tsx
└── ... (other cards)
```

## Minigame Interface

Each minigame component should:

1. Accept props: `{ cardName, orientation, onComplete }`
2. Call `onComplete(score, minigameType)` when finished
3. Score should be 0-100
4. Handle user interactions and game logic
5. Be self-contained and themed to the card

## Implementation Guidelines

- Keep minigames engaging but not too long (30s-2min)
- Score should reflect player performance
- Theme minigames to match the card's meaning
- Use consistent styling with the rest of the app
- Handle mobile and desktop interactions