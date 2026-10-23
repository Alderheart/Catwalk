# Frontend

Vite + React 19 + TypeScript. Tailwind 4 for UI, PixiJS 8 for game scenes. Linted with oxlint.

## Scripts
- `npm run dev`: dev server on http://localhost:5173, also exposed on the LAN for phone testing
- `npm run build`: type check and build
- `npm run lint`: run oxlint

## Layout
Folders follow `docs/decisions/0008-folder-layout.md`. Every file belongs to exactly one of these:
- `src/app/`: the shell. `App.tsx` (safe areas, which screen is showing, the cats and camp shared between screens) and `TabBar.tsx`
- `src/screens/<screen>/`: one folder per page of the game (`camp/`, `patrols/`, `inventory/`), holding its `<Name>Screen.tsx` and everything only that screen uses, Pixi scenes and minigame decks included
  - `camp/`: `CampStage.tsx` mounts the canvas, `CampScene.ts` draws the camp, `campLayout.ts` holds the layout math, `CatTooltip.tsx` is the React overlay
  - `patrols/`: builder, countdown cards, rewards report and `patrolDeck.ts`. Rules live in `backend/src/game/patrols/CLAUDE.md`
- `src/minigames/`: the card system and one folder per card. Rules in `src/minigames/CLAUDE.md`
- `src/api/`: typed wrappers around backend endpoints, one file per backend domain. `client.ts` is the shared fetch helper
- `src/pixi/`: canvas plumbing shared by every Pixi view (`usePixiApp.ts`). No game drawing here
- `src/ui/`: shared React pieces, created when a second screen needs one

Import direction: screens and minigames may import `api/`, `pixi/` and `ui/`. Screens may use minigames; nothing imports a screen except `app/`. A file used by one screen stays in that screen's folder until a second one needs it.
There is no game-mechanics folder on purpose: rules live in the backend.

## Patterns
- Mobile first: design for a phone held in portrait. Use `h-dvh`, respect `env(safe-area-inset-*)`, and keep touch targets at least 44px
- React owns UI and menus; Pixi owns the animated game world. Don't render game objects as DOM, and don't build menus in Pixi
- Cap Pixi resolution at 2x device pixel ratio to keep phones fast
- Pixi init is async, so effects must handle unmounting before init finishes. Use `usePixiApp`, which does. StrictMode mounts effects twice in dev
- All requests go through `api()` in `src/api/client.ts` using paths relative to `/api`; Vite proxies them to the backend in dev
- Info that must work on phones can't rely on hover: mouse hover shows it, and a tap pins it until the next tap (see `CampScene.ts`)
- Don't recreate Pixi objects on hover or focus changes; redraw the existing ones, or the pointer re-enters the new object and loops
- Never compute game outcomes (pulls, rewards, currency) on the client. Ask the backend

## Keeping in sync with the backend
Frontend and backend share no code. Types in `src/api/*.ts` mirror backend responses by hand, so when a backend response shape changes, update the matching file here in the same PR.
