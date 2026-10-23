# Decision records

One short file per decision that shapes the codebase and would be costly to reverse. They exist so a future contributor or agent knows a choice was deliberate, and why, before changing it.

- Name files `NNNN-short-title.md`, numbered in order
- Use the sections in the existing records: Status, Context, Decision, Consequences
- Don't rewrite an old record when a decision changes. Mark it "Superseded by NNNN" and add a new one

## Index
- [0001 Server-authoritative game state](0001-server-authoritative-state.md)
- [0002 Prisma on SQLite, portable to Postgres](0002-prisma-sqlite.md)
- [0003 React for UI, PixiJS for the game world](0003-react-ui-pixi-world.md)
- [0004 Separate frontend and backend packages](0004-separate-packages.md)
- [0005 Deploy to a shared VPS with Caddy and systemd](0005-vps-deploy.md)
- [0006 One implicit player until accounts exist](0006-single-implicit-player.md)
- [0007 Minigames are cards played from a deck](0007-minigame-card-decks.md)
