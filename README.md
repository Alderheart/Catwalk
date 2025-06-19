# Clangen - Cat Colony Management Game

A browser-based game where players manage a colony of wild cats, combining collection mechanics with progression systems.

## 🏗️ Monorepo Structure

```
clangen/
├── apps/
│   ├── frontend/          # React frontend application
│   └── backend/           # Backend API (coming soon)
├── packages/
│   ├── shared/           # Shared types and utilities
│   └── game-logic/       # Shared game mechanics (coming soon)
└── docs/                 # Game design documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install

# Build shared packages
pnpm run shared:build
```

### Development

```bash
# Run all apps in development mode
pnpm run dev

# Run only frontend
pnpm run frontend:dev

# Run only backend (when available)
pnpm run backend:dev
```

### Building

```bash
# Build all packages
pnpm run build

# Build specific apps
pnpm run frontend:build
pnpm run backend:build
```

## 📦 Packages

### `@clangen/frontend`
The main React application featuring:
- Cat colony management interface
- Sprite-based cat rendering
- Random placement system
- Interactive camp environment

### `@clangen/shared`
Shared TypeScript types and utilities used across all packages.

### `@clangen/backend` (Coming Soon)
API server for:
- Multiplayer features
- Trading system
- Market functionality
- Anti-cheat measures

## 🎮 Game Features

- **Cat Collection**: Collect and manage unique cats with different traits
- **Camp Management**: Organize your cats in a customizable camp environment
- **Expeditions**: Send cats on tarot-based expeditions (coming soon)
- **Trading**: Trade cats with other players (coming soon)
- **Marketplace**: Buy and sell cats in a player-driven economy (coming soon)

## 📚 Documentation

See the `/docs` directory for detailed game design documentation:
- `/docs/game-design/` - Core game concepts
- `/docs/mechanics/` - Game mechanics details
- `/docs/systems/` - Technical implementation guides
- `/docs/development/` - Development guides and configuration

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, TypeScript (coming soon)
- **Monorepo**: pnpm workspaces
- **Build Tools**: Vite, tsup

## 📄 License

This project is private and proprietary.