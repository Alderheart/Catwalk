# 0002 Prisma on SQLite, portable to Postgres

Status: Accepted

## Context
The game is a prototype run locally, but should be able to move to a hosted database later without a rewrite.

## Decision
Use Prisma ORM with SQLite (through `@prisma/adapter-better-sqlite3`) for now. Keep the schema portable: only String, Int, Boolean, DateTime and Float types, string `cuid()` ids, no raw SQL, and enum-like values stored as strings and validated in code.

## Consequences
- Local setup needs no database server
- Moving to Postgres is a provider and adapter swap plus a fresh migration history (steps in the root `README.md`)
- No database enums or JSON columns; validation lives in TypeScript
