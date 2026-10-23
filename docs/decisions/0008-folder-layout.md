# 0008 Folders split game domains from plumbing, with the same names on both sides

Status: Accepted

## Context
The frontend mixed three ideas of a folder: by layer (`api/`), by technology (`game/` held Pixi code, most of it camp only) and by feature (`patrols/`, `minigames/`). The backend's domain folders sat next to plumbing like `db.ts` with nothing to tell them apart, and route files did HTTP, transactions and rules at once.

## Decision
- Backend: game domains live in `src/game/<domain>/`, plumbing in `src/platform/`. Each domain splits into `routes.ts` (HTTP), `service.ts` (database) and pure rule files
- Frontend: pages live in `src/screens/<screen>/`, playable minigames in `src/minigames/`, the shell in `src/app/`, and shared plumbing in `src/api/`, `src/pixi/` and `src/ui/`
- A domain has the same name everywhere it appears: `backend/src/game/patrols`, `frontend/src/api/patrols.ts`, `frontend/src/screens/patrols`
- The frontend has no game-mechanics folder, because game rules live only on the backend (0001)

## Consequences
- Finding code starts from the domain or the screen name, not from the technology
- A file used by one screen stays in that screen's folder; it moves to a shared folder only when a second user appears
- Route files stay small, and rules stay testable without a database
- Adding a domain means a backend folder with at least `routes.ts` and `service.ts`, mounted in `app.ts`, and a matching `frontend/src/api/` file
