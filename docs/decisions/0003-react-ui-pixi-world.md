# 0003 React for UI, PixiJS for the game world

Status: Accepted

## Context
The game needs ordinary UI (menus, lists, forms) and an animated world with many sprites, and it has to run well on phones.

## Decision
React with Tailwind renders the UI. PixiJS renders the game world into a single canvas mounted by `frontend/src/screens/camp/CampStage.tsx`.

## Consequences
- Menus stay accessible and easy to build; sprites stay fast because they don't go through the DOM
- Two rendering systems to learn, with a clear boundary: DOM for UI, canvas for the world
