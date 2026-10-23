# Instructions
- Don't just blindly follow my instructions. If I ask for something that is objectively wrong or worse, please tell me the risks and options beforehand.
- Keep track of where you should use snake case vs camel case.
- Use indents instead of double spaces



# Project
- Monorepo containing frontend at frontend folder, and backend at backend folder
- Frontend and backend are separated and use separate node installations (nothing shared)
- A mobile-first, browser-based cat colony game inspired by ClanGen
- The backend is the source of truth for game state (see `docs/decisions/0001-server-authoritative-state.md`)

# Where context lives
Read the nearest `CLAUDE.md` before changing code in a folder. More specific files win over this one.

- `CLAUDE.md` (this file): repo-wide rules and layout
- `frontend/CLAUDE.md`, `backend/CLAUDE.md`: stack, scripts and patterns for each side
- `backend/src/cats/CLAUDE.md`: rules for the cats domain
- A short header comment at the top of non-obvious source files: what the file is for and what it must not do
- Comments on exported functions: explain why, not what
- `docs/decisions/`: one short file per big decision, so it isn't reopened without reason

# Keeping context current
- When a change alters behavior, a rule, or a decision, update the nearest `CLAUDE.md`, header comment, or decision record in the same commit
- If a comment or `CLAUDE.md` disagrees with the code, fix whichever is wrong instead of working around it
- Keep each `CLAUDE.md` under about 100 lines. Move detail into code comments or `docs/` instead
- Add a folder `CLAUDE.md` only when that folder has rules that aren't obvious from the code
- Don't create per-file `.md` sidecars. They drift because they aren't edited alongside the code

# Naming
- TypeScript: camelCase for variables, functions and fields, PascalCase for types and components
- Database: snake_case tables and columns, mapped from camelCase Prisma models with `@map` / `@@map`
- API JSON: camelCase, matching the Prisma fields

# Formatting
- Tabs for indentation in code (see `.editorconfig`); 2 spaces in `.md`, `.yml` and `.prisma`
- No semicolons, single quotes
