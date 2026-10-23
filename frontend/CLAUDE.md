# Frontend

Vite + React 19 + TypeScript. Tailwind 4 for UI, PixiJS 8 for game scenes. Linted with oxlint.

## Scripts
- `npm run dev`: dev server on http://localhost:5173, also exposed on the LAN for phone testing
- `npm run build`: type check and build
- `npm run lint`: run oxlint

## Layout
- `src/App.tsx`: the app shell (safe areas, bottom tab bar, and which screen is showing)
- `src/api/`: typed wrappers around backend endpoints. `client.ts` is the shared fetch helper
- `src/game/`: Pixi rendering. `PixiStage.tsx` owns the canvas lifecycle, `CampScene.ts` draws the camp, `campLayout.ts` holds the layout math
- `src/game/CatTooltip.tsx`: React overlay for cat info, positioned from the rect the scene reports
- `src/patrols/`: React screens for patrols. Placeholder until patrols are designed (see `backend/src/patrols/CLAUDE.md`)

## Patterns
- Mobile first: design for a phone held in portrait. Use `h-dvh`, respect `env(safe-area-inset-*)`, and keep touch targets at least 44px
- React owns UI and menus; Pixi owns the animated game world. Don't render game objects as DOM, and don't build menus in Pixi
- Cap Pixi resolution at 2x device pixel ratio to keep phones fast
- Pixi init is async, so effects must handle unmounting before init finishes (see `PixiStage.tsx`). StrictMode mounts effects twice in dev
- All requests go through `api()` in `src/api/client.ts` using paths relative to `/api`; Vite proxies them to the backend in dev
- Info that must work on phones can't rely on hover: mouse hover shows it, and a tap pins it until the next tap (see `CampScene.ts`)
- Don't recreate Pixi objects on hover or focus changes; redraw the existing ones, or the pointer re-enters the new object and loops
- Never compute game outcomes (pulls, rewards, currency) on the client. Ask the backend

## Keeping in sync with the backend
Frontend and backend share no code. Types in `src/api/*.ts` mirror backend responses by hand, so when a backend response shape changes, update the matching file here in the same PR.
