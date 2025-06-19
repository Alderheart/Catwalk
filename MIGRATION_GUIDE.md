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