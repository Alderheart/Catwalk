# Configuration System

Centralized configuration for camp layout, sprites, and game mechanics.

## Configuration Files

### Camp Configuration (`frontend/src/config/campConfig.ts`)
Controls camp layout and cat placement:

```typescript
campConfig.placement.default.minX  // Boundaries
campConfig.spacing.avoidOverlap    // Overlap prevention
campConfig.effects.mirrorChance    // Visual effects
campConfig.styling.background      // CSS styling
```

**Sections:**
- `dimensions` - Camp container size
- `placement` - Cat positioning boundaries
- `spacing` - Overlap and distance settings
- `effects` - Visual properties
- `styling` - CSS classes

### Sprite Configuration (`frontend/src/config/spriteConfig.ts`)
Manages sprite rendering and sizing:

```typescript
spriteConfig.sizes.default  // 128px
getSpriteUrl('cat-sprite')  // Full asset path
getSizeClass(128)          // Tailwind classes
```

**Sections:**
- `sizes` - Sprite dimensions
- `rendering` - Image settings
- `paths` - Asset directories
- `animations` - Transitions
- `tooltip` - Hover tooltips

## Usage Examples

### Change Sprite Sizes
```typescript
// In spriteConfig.ts
sizes: {
  default: 160,  // Larger cats
  small: 80,
}
```

### Adjust Cat Placement
```typescript
// In campConfig.ts
spacing: {
  avoidOverlap: false,
  minDistance: 20,
}
```

### Customize Styling
```typescript
// In campConfig.ts
styling: {
  background: {
    from: 'from-blue-400',
    to: 'to-blue-600',
  }
}
```