# Cat Placement System

Manages cat positioning and display in the camp environment.

## Architecture

```
Camp Component
    ↓ uses
useCatPlacement Hook → CampCat Component → CatSprite Component
    ↓ generates              ↓ renders         ↓ displays
CatWithPosition[]        Positioned Cat      PNG Sprite
```

## Components

### useCatPlacement Hook (`frontend/src/hooks/useCatPlacement.ts`)
Handles cat positioning with:
- Random placement within boundaries
- Optional overlap prevention
- Visual properties (scale, rotation, mirroring)

**Options**:
```typescript
{
  avoidOverlap?: boolean    // Prevent overlapping (default: false)
  minDistance?: number      // Min distance between cats (%)
  spriteSize?: number       // For boundary calculations
  minX?, maxX?, minY?, maxY?: number  // Placement boundaries (%)
}
```

### CampCat Component (`frontend/src/components/CampCat.tsx`)
Renders individual cats with:
- Percentage-based positioning
- Click handling and hover tooltips
- Visual transforms

### CatSprite Component (`frontend/src/components/CatSprite.tsx`)
Image renderer for pixel art sprites with crisp rendering.

## Assets

Sprites location: `/public/assets/sprites/cats/`

To add new sprites:
1. Add PNG to sprites directory
2. Update `/src/data/mockCats.ts`:
```typescript
{
  id: 'unique-id',
  name: 'CatName',
  spriteUrl: '/assets/sprites/cats/filename.png'
}
```

## Usage

```typescript
const catsWithPositions = useCatPlacement(mockCats, {
  avoidOverlap: true,
  minDistance: 12,
  spriteSize: 128
});
```

## Position Properties

Each cat receives:
- `x, y`: Position (0-100%)
- `scale`: Size multiplier
- `rotation`: Angle in degrees
- `mirrored`: Horizontal flip flag