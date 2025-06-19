# Bottom Tab Bar Documentation

## Overview
The bottom tab bar provides navigation between the main sections of the Clangen mobile app. It's designed to be mobile-first with support for safe areas on modern devices.

## Components

### BottomTabBar Component
Located at: `apps/frontend/src/components/BottomTabBar.tsx`

The main tab bar component that renders four navigation tabs:
- **Camp** - Main camp view where cats are displayed
- **Cats** - Cat management (placeholder)
- **Expeditions** - Expedition system (placeholder)
- **Menu** - Game menu and settings (placeholder)

Features:
- Fixed positioning at screen bottom
- Safe area padding for devices with home indicators
- Visual feedback on active tab (green color)
- Hover states for better UX
- Touch-friendly button sizing (64px height)

### Tab Bar Store (Zustand)
Located at: `apps/frontend/src/stores/tabBarStore.ts`

Global state management for the tab bar using Zustand:

```typescript
interface TabBarState {
  showTabBar: boolean      // Current visibility state
  activeTab: string        // Currently active tab ID
  setShowTabBar: (show: boolean) => void
  setActiveTab: (tabId: string) => void
  hideForMinigame: () => void    // Hide tab bar for minigames
  showAfterMinigame: () => void  // Show tab bar after minigames
}
```

## Usage

### Basic Usage in Components
```typescript
import { useTabBarStore } from '../stores/tabBarStore'

function MyComponent() {
  const { activeTab, setActiveTab } = useTabBarStore()
  
  // Change active tab
  setActiveTab('expeditions')
}
```

### Hiding Tab Bar for Minigames
```typescript
import { useEffect } from 'react'
import { useTabBarStore } from '../stores/tabBarStore'

function Minigame() {
  const { hideForMinigame, showAfterMinigame } = useTabBarStore()
  
  useEffect(() => {
    // Hide when minigame starts
    hideForMinigame()
    
    // Show when minigame ends
    return () => {
      showAfterMinigame()
    }
  }, [])
  
  return <div>Minigame content...</div>
}
```

## Mobile Optimizations

### CSS Classes
Added to `apps/frontend/src/index.css`:

- `.safe-area-bottom` - Adds padding for iPhone X+ home indicators
- Viewport height fixes for mobile browsers
- Overscroll behavior prevention

### Safe Area Support
The tab bar automatically adjusts for devices with home indicators using:
```css
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Architecture Decisions

### Why Zustand?
- Lightweight state management (3kb)
- No providers needed
- TypeScript support out of the box
- Easy to use hooks API
- Perfect for small to medium state needs

### Mobile-First Design
- Fixed 64px height for easy thumb reach
- Large touch targets (full height buttons)
- Visual feedback for active state
- Minimal text to save space

## Future Enhancements
- Add icon animations on tab switch
- Implement badge system for notifications
- Add haptic feedback on tab press (mobile)
- Consider gesture-based navigation