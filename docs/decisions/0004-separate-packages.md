# 0004 Separate frontend and backend packages

Status: Accepted

## Context
The repo holds both the browser game and its server.

## Decision
`frontend/` and `backend/` are independent packages with their own `package.json` and `node_modules`. They share no code, not even types.

## Consequences
- Each side can be installed, built and deployed on its own
- API types are duplicated: `frontend/src/api/*.ts` mirrors backend responses by hand and must be updated in the same PR as a backend shape change
