# Cats List

## Overview
Scrollable list view of all cats with click interaction to view details.

## Components

### CatsList (`frontend/src/components/CatsList.tsx`)
Full-screen list component displaying all cats from mock data.

**Features:**
- Scrollable list with custom-styled scrollbar
- Cat sprites with pixelated rendering
- Click interaction opens CatModal
- Hover states for better UX
- Safe area support for notched devices

**Layout:**
- Header with "All Cats" title
- Individual cat cards with sprite, info, and arrow
- Modal integration for detailed cat view

## Usage

```typescript
import CatsList from './components/CatsList';

// In App.tsx navigation
case 'cats':
  return <CatsList />
```

## Cat Card Structure

Each cat card displays:
- **Cat sprite** (64px) with pixelated rendering
- **Name** as main heading
- **Age** in moons
- **Breed** information
- **Arrow indicator** showing it's clickable

## Styling

**Background:** Blue gradient (`from-blue-900 to-blue-950`)
**Cards:** Semi-transparent white with backdrop blur
**Scrollbar:** Custom styled with rounded edges and hover effects

## Custom Scrollbar

Uses `.custom-scrollbar` class defined in `index.css`:
- 8px width with rounded edges
- Semi-transparent white styling
- Smooth hover transitions
- Cross-browser support (webkit + Firefox)