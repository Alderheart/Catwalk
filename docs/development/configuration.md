# Configuration System

The Clangen project uses centralized configuration files to manage settings for camp layout, sprite rendering, and game mechanics. This makes it easy to adjust values without hunting through code files.

## Configuration Files

### Camp Configuration (`/src/config/campConfig.ts`)

Controls camp layout, cat placement, and visual styling:

```typescript
import { campConfig } from '../config/campConfig';

// Access placement settings
campConfig.placement.default.minX  // Default boundaries
campConfig.spacing.avoidOverlap    // Overlap prevention
campConfig.effects.mirrorChance    // Random mirroring

// Access visual styling
campConfig.styling.background.from // Gradient colors
campConfig.dimensions.height       // Camp area size
```

**Key Sections:**
- `dimensions`: Camp container width/height
- `placement`: Boundary settings for cat positioning
- `spacing`: Overlap prevention and distance settings
- `effects`: Visual properties (mirroring, scaling, rotation)
- `styling`: CSS classes for backgrounds and styling

### Sprite Configuration (`/src/config/spriteConfig.ts`)

Manages sprite rendering, sizing, and asset paths:

```typescript
import { spriteConfig, getSpriteUrl } from '../config/spriteConfig';

// Access sprite sizes
spriteConfig.sizes.default  // 128px
spriteConfig.sizes.small    // 64px
spriteConfig.sizes.large    // 160px

// Helper functions
getSpriteUrl('cat-sprite')  // Returns full path
getSizeClass(128)          // Returns Tailwind classes
```

**Key Sections:**
- `sizes`: Predefined sprite dimensions
- `rendering`: Image rendering and CSS settings
- `paths`: Asset directory structure
- `animations`: Transition and hover effects
- `tooltip`: Name tooltip styling

## Helper Functions

### `getSpriteUrl(filename)`
Generates full asset paths:
```typescript
getSpriteUrl('moonwhisker') // → '/assets/sprites/cats/moonwhisker.png'
```

### `getSizeClass(size)`
Converts pixel sizes to Tailwind classes:
```typescript
getSizeClass(128) // → 'w-32 h-32'
getSizeClass(96)  // → 'w-24 h-24'
```

## Usage Examples

### Changing Sprite Sizes
Edit `/src/config/spriteConfig.ts`:
```typescript
sizes: {
  default: 160,  // Make cats larger
  small: 80,     // Increase small size
  // ...
}
```

### Adjusting Cat Placement
Edit `/src/config/campConfig.ts`:
```typescript
spacing: {
  avoidOverlap: false,    // Allow overlapping
  minDistance: 20,        // Increase spacing
  // ...
},
effects: {
  mirrorChance: 0.3,      // Less mirroring
  // ...
}
```

### Customizing Visual Style
```typescript
styling: {
  background: {
    from: 'from-blue-400',  // Different gradient
    to: 'to-blue-600',
  },
  // ...
}
```

## Benefits

### ✅ Easy Tweaking
- Adjust game balance without searching code
- Modify visual styling in one place
- Test different configurations quickly

### ✅ Type Safety
- Configuration objects are strongly typed
- IDE autocomplete for all settings
- Compile-time validation of values

### ✅ Documentation
- Self-documenting with JSDoc comments
- Clear organization by functionality
- Helper functions for common operations

### ✅ Maintainability
- Centralized configuration reduces duplication
- Easy to see all related settings together
- Changes propagate automatically to components

## Adding New Configuration

### 1. Create New Config File
```typescript
// /src/config/newConfig.ts
export const newConfig = {
  feature: {
    setting: 'value',
    // ...
  }
} as const;
```

### 2. Import in Components
```typescript
import { newConfig } from '../config/newConfig';

// Use in component
const value = newConfig.feature.setting;
```

### 3. Update Documentation
Add the new config to this guide and relevant component documentation.

## Best Practices

- **Use `as const`** for configuration objects to ensure literal types
- **Group related settings** in logical sections
- **Provide JSDoc comments** for complex settings
- **Create helper functions** for common operations
- **Use TypeScript** for type safety and autocomplete
- **Document defaults** in JSDoc comments