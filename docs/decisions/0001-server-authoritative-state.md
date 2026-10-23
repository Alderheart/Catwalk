# 0001 Server-authoritative game state

Status: Accepted

## Context
The game has gacha-style pulls and will have currency. Anything computed or stored in the browser can be edited by the player.

## Decision
The backend owns all game state and rules. The frontend talks to it over HTTP and never touches the database or decides outcomes such as random rolls, rewards or currency changes.

## Consequences
- Every new mechanic needs a backend endpoint, even simple ones
- The game needs a connection to play
- Cheating requires attacking the server, not editing local state
