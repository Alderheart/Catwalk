# Energy System

## Game Mechanics
- Users start with 5 energy, max 5
- Regenerates 1 energy per 15 minutes (all upgradeable)
- Prevents abuse of costly game actions
- Energy auto-regenerates when checked via API endpoints or `energyUtils.ts`

## Implementation
- Middleware-based energy validation and consumption
- Import: `import { requireEnergy, consumeEnergy, requireAndConsumeEnergy } from '../middleware/energyMiddleware'`
- Usage: `router.post('/action', authMiddleware, requireAndConsumeEnergy(1), handler)`
- Alternative two-step approach:
  - Check first: `requireEnergy(1)` 
  - Consume after success: `consumeEnergy(1)`

## Debugging
- Energy middleware logs errors to console for debugging
- Check user energy: `GET /auth/profile/energy`