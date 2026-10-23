# 0005 Deploy to a shared VPS with Caddy and systemd

Status: Accepted

## Context
The game needs to be reachable from a phone anywhere. The available host is a single VPS that already runs a Minecraft server, so the deploy has to be light on RAM and must not touch that server or its port.

## Decision
Run the backend as a plain Node process under systemd, bound to `127.0.0.1`, with a memory cap. Put Caddy in front to serve the built frontend, proxy `/api` and handle HTTPS. Keep the SQLite file in `/var/lib/catwalk`, outside the code checkout. No Docker. Steps are in `docs/deploy.md`.

## Consequences
- One small process and no container runtime, so Minecraft keeps almost all the RAM
- Frontend and backend share one origin, so there's no CORS setup and the frontend keeps calling `/api` as in dev
- Deploys are a `git pull` and rebuild on the server (`deploy/deploy.sh`); there's no CI deploy yet
- If something else on the box already owns ports 80 and 443, the Caddy part is replaced by a site in that server's config
