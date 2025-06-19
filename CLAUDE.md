# Claude Code Instructions for Clangen

## Project Overview
Clangen is a cat colony management game built with React, Vite, and Tailwind CSS. Players manage a colony of wild cats living in a forest, combining collection mechanics with progression systems. This is a monorepo using pnpm workspaces.

## Key Directories
- `/apps/frontend/src` - Frontend React application source code
- `/packages/shared` - Shared types and utilities
- `/docs` - Game design documentation and reference materials
- `/public` - Static assets

## Development Guidelines
- Use TypeScript for all new code
- Follow existing code style and conventions
- Use Tailwind CSS for styling
- Test changes before committing
- Use Zustand for global state management
- Mobile-first design approach

## Commands
- `npm run dev` - Start development server (run from apps/frontend)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npx pnpm add [package] --filter @clangen/frontend` - Add packages to frontend
- `npx pnpm add [package] --filter @clangen/shared` - Add packages to shared

## Game Documentation Structure
- `/docs/game-design/overview.md` - Core game concept and gameplay loop
- `/docs/mechanics/expeditions.md` - Tarot-based expedition system
- `/docs/mechanics/camp.md` - Camp hub mechanics
- `/docs/systems/cat-system.md` - Cat attributes, progression, and customization
- `/docs/ui/bottom-tab-bar.md` - Mobile navigation implementation

## State Management
- Using Zustand for global state
- Tab bar state: `useTabBarStore()` from `stores/tabBarStore.ts`
- Hide tab bar for minigames: `hideForMinigame()` / `showAfterMinigame()`

## Important Notes
- Always check `/docs` for game design documentation when implementing features
- Maintain consistency with existing game mechanics and lore
- Core gameplay revolves around cats with unique traits, expeditions, and colony management
- The game uses a tarot card system for expeditions
- Cat customization is cosmetic only and a major engagement driver
- Mobile-first design with bottom navigation bar