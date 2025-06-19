# Monorepo Migration Guide

This document explains the changes made to convert Clangen to a monorepo structure.

## 🚀 Quick Start

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install all dependencies
pnpm install

# Build shared packages first
pnpm run shared:build

# Start development
pnpm run frontend:dev
```

## 📁 What Changed

### Directory Structure
- All frontend code moved to `apps/frontend/`
- Created `packages/shared/` for shared types
- Added workspace configuration files

### New Files
- `/package.json` - Root workspace configuration
- `/pnpm-workspace.yaml` - pnpm workspace definition
- `/packages/shared/` - Shared types package

### Import Changes
Frontend imports will need to be updated to use the shared package:

```typescript
// Old
import { Cat } from '../types/Cat';

// New (once you update the imports)
import { Cat } from '@clangen/shared';
```

## 🔧 Available Commands

### Root Level
- `pnpm run dev` - Run all apps in development
- `pnpm run build` - Build all packages
- `pnpm run lint` - Lint all packages

### App Specific
- `pnpm run frontend:dev` - Run only frontend
- `pnpm run frontend:build` - Build only frontend
- `pnpm run shared:build` - Build shared package

## ⚠️ Important Notes

1. **Always use pnpm** - Don't use npm or yarn
2. **Build shared first** - Run `pnpm run shared:build` after installing
3. **Import updates needed** - Frontend imports from shared package need updating

## 🔄 Next Steps

1. Update frontend imports to use `@clangen/shared`
2. Create backend app when ready
3. Move game logic to `packages/game-logic/`
4. Add more shared utilities as needed

## 🆘 Troubleshooting

### "Module not found: @clangen/shared"
Run `pnpm run shared:build` first.

### Changes to shared types not reflecting
Rebuild shared: `pnpm run shared:build` or use `pnpm run shared:dev` for watch mode.

## 📅 Recent Updates (June 19, 2025)

### New Features
1. **Bottom Tab Bar Navigation**
   - Mobile-first navigation with 4 tabs
   - Zustand state management integration
   - Safe area support for modern devices
   - See `/docs/ui/bottom-tab-bar.md` for details

2. **Responsive Design Improvements**
   - Fixed mobile overflow/scrollbar issues
   - Responsive camp view with aspect ratios
   - Dynamic sprite sizing based on viewport

3. **Cat Popup Positioning Fixes**
   - Improved center alignment
   - Removed edge margin constraints
   - Fixed transform duplication issues

### New Dependencies
```bash
# Added to frontend
npx pnpm add zustand --filter @clangen/frontend
```

### State Management
The app now uses Zustand for global state:
```typescript
import { useTabBarStore } from './stores/tabBarStore'

// Hide tab bar for minigames
const { hideForMinigame, showAfterMinigame } = useTabBarStore()
```

### Documentation
- `/docs/development/session-changes-2025-06-19.md` - Detailed session changes
- `/docs/ui/bottom-tab-bar.md` - Tab bar implementation guide