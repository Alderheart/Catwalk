# Cat Placement System

The cat placement system manages how cats are positioned and displayed in the camp environment. It consists of three main components that work together to create dynamic, visually appealing cat arrangements.

## Architecture Overview

```
Camp Component
    ↓ uses
useCatPlacement Hook → CampCat Component → CatSprite Component
    ↓ generates              ↓ renders         ↓ displays
CatWithPosition[]        Positioned Cat      PNG Sprite
```

## Components

### useCatPlacement Hook
**Location**: `/src/hooks/useCatPlacement.ts`

Core hook that handles cat positioning logic with the following features:

- **Random Placement**: Distributes cats randomly within configurable boundaries
- **Overlap Prevention**: Optional collision detection to prevent cats from spawning too close
- **Boundary Calculation**: Automatically adjusts placement area to prevent sprite clipping
- **Visual Properties**: Assigns random mirroring, scaling, and rotation values

**Key Options**:
- `avoidOverlap`: Prevents cats from overlapping (default: false)
- `minDistance`: Minimum distance between cats in percentage units
- `spriteSize`: Used for boundary calculations to prevent edge clipping
- Boundary controls: `minX`, `maxX`, `minY`, `maxY`

### CampCat Component
**Location**: `/src/components/CampCat.tsx`

Renders individual cats in the camp with:

- **Positioning**: Uses percentage-based positioning for responsive design
- **Interactions**: Click handling and hover effects
- **Visual Effects**: Applies transforms (rotation, scaling, mirroring)
- **Tooltips**: Shows cat name on hover
- **Accessibility**: Proper alt text and semantic markup

### CatSprite Component
**Location**: `/src/components/CatSprite.tsx`

Simple image renderer optimized for pixel art:

- **Pixel-Perfect Rendering**: Uses `imageRendering: 'pixelated'` for crisp sprites
- **Dynamic Sizing**: Accepts size prop for flexible scaling
- **Asset Loading**: Handles PNG sprite files from `/public/assets/sprites/cats/`

## Asset Management

### Directory Structure
```
public/
└── assets/
    └── sprites/
        └── cats/
            ├── Cat-1-Sitting.png
            ├── Cat-2-Sitting.png
            └── ...
```

### Adding New Sprites
1. Place PNG files in `/public/assets/sprites/cats/`
2. Update cat data in `/src/data/mockCats.ts`:
   ```typescript
   {
     id: 'unique-id',
     name: 'CatName',
     spriteUrl: '/assets/sprites/cats/filename.png'
     // ... other properties
   }
   ```

## Usage Examples

### Basic Usage
```typescript
// In Camp component
const catsWithPositions = useCatPlacement(mockCats, {
  avoidOverlap: true,
  minDistance: 12,
  spriteSize: 128
});
```

### Custom Placement
```typescript
// Custom boundaries and larger sprites
const catsWithPositions = useCatPlacement(cats, {
  minX: 20,
  maxX: 80,
  minY: 15,
  maxY: 85,
  spriteSize: 256,
  avoidOverlap: true,
  minDistance: 20
});
```

## Visual Properties

Each placed cat receives these properties:

- **x, y**: Position as percentage (0-100)
- **scale**: Size multiplier (default: 1)
- **rotation**: Angle in degrees (default: 0)
- **mirrored**: Horizontal flip flag (50% random chance)

## Performance Considerations

- **useMemo**: Hook uses memoization to prevent recalculation on re-renders
- **Boundary Pre-calculation**: Sprite boundaries calculated once, not per cat
- **Fallback Placement**: If overlap prevention fails after 50 attempts, places cat anyway
- **Percentage Positioning**: Responsive design that scales with container size

## Future Enhancements

The system is designed to support:

- **Animations**: Walking, idle behaviors, activity-based movement
- **Activity Zones**: Cats preferring certain areas (food, water, sleeping spots)
- **Time-based Placement**: Different arrangements for day/night cycles
- **Personality-based Positioning**: Shy cats avoiding crowds, social cats grouping together
- **Interactive Behaviors**: Cats reacting to player actions or each other