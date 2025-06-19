# Bottom Tab Bar

## Overview
Navigation component for the main sections of the app. Fixed at bottom with mobile-safe area support.

## Components

### BottomTabBar (`frontend/src/components/BottomTabBar.tsx`)
Renders four navigation tabs:
- **Camp** - Main camp view where cats are displayed
- **Cats** - Cat management (placeholder)
- **Expeditions** - Expedition system (placeholder)
- **Menu** - Game menu and settings (placeholder)

### Tab Bar Store (`frontend/src/stores/tabBarStore.ts`)
Zustand store managing tab state:

```typescript
interface TabBarState {
  showTabBar: boolean      // Visibility state
  activeTab: string        // Current tab ID
  setShowTabBar: (show: boolean) => void
  setActiveTab: (tabId: string) => void
  hideForMinigame: () => void    // Hide for fullscreen views
  showAfterMinigame: () => void  // Restore after fullscreen
}
```

## Usage

```typescript
import { useTabBarStore } from '../stores/tabBarStore'

// In a component
const { activeTab, setActiveTab } = useTabBarStore()
setActiveTab('expeditions')

// Hide for minigames
const { hideForMinigame, showAfterMinigame } = useTabBarStore()
useEffect(() => {
  hideForMinigame()
  return () => showAfterMinigame()
}, [])
```

## Mobile Support
- Safe area padding for devices with home indicators
- 64px fixed height for thumb reach
- Overscroll prevention in `index.css`