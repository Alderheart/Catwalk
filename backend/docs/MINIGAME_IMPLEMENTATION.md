# Minigame Implementation Guide

This guide explains how to implement new minigames for the tarot card expedition system.

## Overview

The expedition system uses Major Arcana tarot cards, where each card (and its orientation) can trigger a unique minigame. Players must complete these minigames to determine their expedition rewards.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Tarot Card    │    │    Minigame      │    │    Rewards      │
│  + Orientation  │───►│   Component      │───►│  Based on Score │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Step-by-Step Implementation

### 1. Register the Minigame

First, update the tarot registry to map your card to a minigame type:

**File**: `/backend/src/lib/tarotRegistry.ts`

```typescript
'Your Card Name': {
  name: 'Your Card Name',
  number: X,
  uprightMeaning: 'Card meaning when upright',
  reversedMeaning: 'Card meaning when reversed',
  uprightMinigame: 'your-minigame-type',    // Add this
  reversedMinigame: 'your-reversed-type',   // Optional: different minigame for reversed
}
```

**Example** (The Hermit is already implemented):
```typescript
'The Hermit': {
  name: 'The Hermit',
  number: 9,
  uprightMeaning: 'Self-reflection, introspection, inner guidance',
  reversedMeaning: 'Isolation, loneliness, withdrawal',
  uprightMinigame: 'hunting', // Maps to hunting minigame
}
```

### 2. Create Backend API Endpoints (Future Enhancement)

When ready to implement the multi-step flow, you'll need these endpoints:

```typescript
// Start a specific minigame
POST /expeditions/:expeditionId/minigames/:cardPosition/start
{
  "minigameType": "hunting"
}

// Submit minigame results
POST /expeditions/:expeditionId/minigames/:cardPosition/complete
{
  "score": 85,           // 0-100 score
  "timeElapsed": 45000,  // milliseconds
  "extraData": {}        // minigame-specific data
}
```

### 3. Create Frontend Minigame Component

Create your minigame component in the frontend:

**File**: `/frontend/src/components/minigames/YourMinigameName.tsx`

```typescript
import React, { useState, useEffect } from 'react';

interface YourMinigameProps {
  onComplete: (score: number, extraData?: any) => void;
  onCancel: () => void;
  difficulty?: number; // Based on expedition spread type
}

const YourMinigame: React.FC<YourMinigameProps> = ({ 
  onComplete, 
  onCancel, 
  difficulty = 1 
}) => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');

  const handleGameComplete = () => {
    // Calculate final score (0-100)
    const finalScore = Math.min(100, Math.max(0, score));
    
    // Optional: Include extra data about performance
    const extraData = {
      accuracy: 0.85,
      timeBonus: true,
      perfectMoves: 5
    };
    
    onComplete(finalScore, extraData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Your Minigame Name</h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Your minigame UI here */}
        <div className="minigame-content">
          {/* Game logic, controls, visuals */}
        </div>
        
        {gameState === 'completed' && (
          <div className="text-center mt-4">
            <button
              onClick={handleGameComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Complete Minigame
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourMinigame;
```

### 4. Register in Minigame Router

Create or update the minigame router:

**File**: `/frontend/src/components/minigames/MinigameRouter.tsx`

```typescript
import React from 'react';
import { TarotCardName } from '../../services/expeditionsService';
import HuntingMinigame from './HuntingMinigame';
import YourMinigame from './YourMinigame';

interface MinigameRouterProps {
  cardName: TarotCardName;
  orientation: 'upright' | 'reversed';
  onComplete: (score: number, extraData?: any) => void;
  onCancel: () => void;
}

const MinigameRouter: React.FC<MinigameRouterProps> = ({
  cardName,
  orientation,
  onComplete,
  onCancel
}) => {
  // Map card + orientation to minigame component
  const getMinigameComponent = () => {
    switch (cardName) {
      case 'The Hermit':
        if (orientation === 'upright') {
          return <HuntingMinigame onComplete={onComplete} onCancel={onCancel} />;
        }
        break;
        
      case 'Your Card Name':
        if (orientation === 'upright') {
          return <YourMinigame onComplete={onComplete} onCancel={onCancel} />;
        }
        break;
        
      // Add more cases here
      
      default:
        return (
          <div className="text-center text-white">
            <p>Minigame for {cardName} ({orientation}) not yet implemented</p>
            <button onClick={() => onComplete(50)} className="mt-4 bg-blue-600 px-4 py-2 rounded">
              Skip (50 points)
            </button>
          </div>
        );
    }
  };

  return getMinigameComponent();
};

export default MinigameRouter;
```

### 5. Update Expedition Flow

Modify ExpeditionsPage to show minigame selection after cards are drawn:

```typescript
// In ExpeditionsPage.tsx, add minigame state
const [currentMinigame, setCurrentMinigame] = useState<number | null>(null);

// Show minigame selection when expedition status is 'cards_drawn'
{currentExpedition && currentExpedition.expedition.status === 'cards_drawn' && (
  <div className="minigame-selection">
    {currentExpedition.cards.map((card, index) => (
      <button
        key={index}
        onClick={() => setCurrentMinigame(index)}
        className="card-minigame-button"
      >
        Play {card.tarotCardName} Minigame
      </button>
    ))}
  </div>
)}

// Show active minigame
{currentMinigame !== null && (
  <MinigameRouter
    cardName={currentExpedition.cards[currentMinigame].tarotCardName}
    orientation={currentExpedition.cards[currentMinigame].orientation}
    onComplete={(score, extraData) => {
      // Submit score to backend
      // Mark minigame as completed
      // Show next minigame or complete expedition
    }}
    onCancel={() => setCurrentMinigame(null)}
  />
)}
```

## Minigame Design Guidelines

### Score System (0-100)
- **90-100**: Exceptional performance, maximum rewards
- **70-89**: Good performance, full rewards
- **50-69**: Average performance, reduced rewards  
- **30-49**: Poor performance, minimal rewards
- **0-29**: Failure, very small rewards

### Difficulty Scaling
Adjust difficulty based on expedition spread type:
- **Three-card**: Base difficulty
- **Horseshoe**: +20% difficulty, +20% rewards
- **Four-directions**: +40% difficulty, +40% rewards

### Performance Factors
Consider tracking:
- **Speed**: How quickly the player completes the minigame
- **Accuracy**: Precision of player actions
- **Efficiency**: Optimal vs actual moves/actions
- **Creativity**: Unique approaches (for puzzle games)

### Accessibility
- **Keyboard controls**: Support for non-mouse users
- **Time limits**: Should be generous, not stressful
- **Clear instructions**: Explain controls and objectives
- **Visual feedback**: Clear success/failure indicators

## Card-Specific Minigame Ideas

### Combat/Action Cards
- **The Chariot**: Racing/momentum game
- **Strength**: Timing-based strength challenges
- **The Tower**: Destruction/building game

### Wisdom/Strategy Cards
- **The High Priestess**: Pattern recognition
- **The Magician**: Resource management
- **Justice**: Decision-making scenarios

### Social/Emotional Cards
- **The Lovers**: Relationship puzzles
- **The Emperor**: Leadership challenges
- **The Hierophant**: Teaching/learning game

### Nature/Spiritual Cards
- **The Star**: Navigation/guidance game
- **The Moon**: Illusion/perception challenges
- **The Sun**: Growth/nurturing simulation

## Testing Your Minigame

1. **Unit Tests**: Test game logic separately
2. **Integration Tests**: Test with expedition system
3. **Playtesting**: Verify fun and difficulty balance
4. **Performance**: Ensure smooth 60fps gameplay
5. **Accessibility**: Test keyboard-only controls

## Example: Adding "The Magician" Minigame

1. **Register in tarotRegistry.ts**:
```typescript
'The Magician': {
  // ... existing properties
  uprightMinigame: 'spell-crafting',
  reversedMinigame: 'illusion-breaking'
}
```

2. **Create SpellCraftingMinigame.tsx**:
```typescript
// Resource management game where player combines ingredients
// Score based on efficiency and creativity
```

3. **Add to MinigameRouter.tsx**:
```typescript
case 'The Magician':
  if (orientation === 'upright') {
    return <SpellCraftingMinigame onComplete={onComplete} onCancel={onCancel} />;
  } else {
    return <IllusionBreakingMinigame onComplete={onComplete} onCancel={onCancel} />;
  }
```

## Future Enhancements

- **Save/Resume**: Allow players to pause long minigames
- **Replay System**: Let players replay minigames for better scores
- **Leaderboards**: Compare scores with other players
- **Seasonal Events**: Special minigame variants
- **Customization**: Let players adjust difficulty settings

---

Ready to implement your first minigame? Start with The Hermit's hunting game or choose any card that inspires you!