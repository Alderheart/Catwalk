# Top Header

## Overview
Fixed header bar at the top of the app with automatic notch detection and safe area support.

## Components

### TopHeader (`frontend/src/components/TopHeader.tsx`)
Simple header with app branding and intelligent spacing for notched devices.

**Features:**
- Automatic notch detection using `useNotchDetection` hook
- Dynamic padding adjustment for safe areas
- Green theme styling to match app design
- Centered "Clangen" title

### useNotchDetection Hook (`frontend/src/hooks/useNotchDetection.ts`)
Detects device notches and safe area insets using CSS environment variables.

**Returns:**
```typescript
interface NotchInfo {
  hasNotch: boolean        // True if device has any safe area insets
  safeAreaTop: number      // Top safe area in pixels
  safeAreaBottom: number   // Bottom safe area in pixels
  safeAreaLeft: number     // Left safe area in pixels
  safeAreaRight: number    // Right safe area in pixels
}
```

**Features:**
- Real-time detection using test DOM element
- Orientation change handling
- Window resize support
- Works on all devices (iPhone X+, Android punch-holes)

## Usage

### Basic Header
```typescript
import TopHeader from './components/TopHeader';

// In App.tsx
<TopHeader />
```

### Custom Notch Detection
```typescript
import { useNotchDetection } from '../hooks/useNotchDetection';

function MyComponent() {
  const { hasNotch, safeAreaTop } = useNotchDetection();
  
  return (
    <div style={{ paddingTop: hasNotch ? safeAreaTop : 0 }}>
      Content
    </div>
  );
}
```

### CSS Classes
Alternative CSS-only approach in `index.css`:
```css
.safe-area-top-conditional {
  padding-top: max(env(safe-area-inset-top), 0px);
}
```

## Integration
The header is integrated into the main App layout using flexbox:
- Header takes natural height
- Main content area uses `flex-1` to fill remaining space
- Bottom tab bar fixed at bottom