/**
 * Energy System Middleware
 * 
 * USAGE GUIDE FOR FUTURE DEVELOPERS:
 * 
 * 1. **Simple Energy Protection** (most common):
 *    ```typescript
 *    router.post('/expedition', authMiddleware, requireAndConsumeEnergy(1), expeditionHandler);
 *    ```
 * 
 * 2. **Two-Step Energy Protection** (for complex operations):
 *    ```typescript
 *    router.post('/complex-action', 
 *      authMiddleware, 
 *      requireEnergy(2),  // Check first
 *      complexOperationHandler,  // Do the work
 *      consumeEnergy(2)   // Consume after success
 *    );
 *    ```
 * 
 * 3. **Access Energy Info in Handler**:
 *    ```typescript
 *    const handler = (req: AuthenticatedRequest, res: Response) => {
 *      const currentEnergy = req.userEnergy?.current;
 *      const energyConsumed = req.energyConsumed?.amount;
 *      // ... use energy info
 *    };
 *    ```
 * 
 * 4. **Energy Costs by Action Type**:
 *    - Expeditions: 1 energy
 *    - Major actions: 2-3 energy
 *    - Premium features: Variable energy
 * 
 * IMPORTANT NOTES:
 * - Always use AFTER authMiddleware
 * - Energy auto-regenerates when checked
 * - All errors include current energy status
 * - Middleware extends AuthenticatedRequest with energy info
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getUserEnergyStatus, consumeUserEnergy } from '../lib/energyUtils';

/**
 * Middleware to check if user has enough energy for an action
 * Does not consume energy - only validates it exists
 * @param requiredEnergy - Amount of energy required (default: 1)
 */
export const requireEnergy = (requiredEnergy: number = 1) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      const energyStatus = await getUserEnergyStatus(req.userId);
      
      if (!energyStatus) {
        res.status(500).json({
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to get energy status'
          }
        });
        return;
      }

      if (energyStatus.daily_energy < requiredEnergy) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_ENERGY',
            message: `Not enough energy. Required: ${requiredEnergy}, Available: ${energyStatus.daily_energy}`
          },
          data: {
            required_energy: requiredEnergy,
            current_energy: energyStatus.daily_energy
          }
        });
        return;
      }

      // Add energy info to request for use in route handler
      req.userEnergy = {
        current: energyStatus.daily_energy,
        required: requiredEnergy
      };

      next();
    } catch (error) {
      console.error('Energy middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to check user energy'
        }
      });
    }
  };
};

/**
 * Middleware to consume energy for an action
 * This should be used after the main action succeeds to actually deduct energy
 * @param energyAmount - Amount of energy to consume (default: 1)
 */
export const consumeEnergy = (energyAmount: number = 1) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      const consumeResult = await consumeUserEnergy(req.userId, energyAmount);
      
      if (!consumeResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ENERGY_CONSUMPTION_FAILED',
            message: consumeResult.error || 'Failed to consume energy'
          }
        });
        return;
      }

      // Add consumed energy info to request
      req.energyConsumed = {
        amount: energyAmount,
        remaining: consumeResult.currentEnergy || 0
      };

      next();
    } catch (error) {
      console.error('Energy consumption middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to consume user energy'
        }
      });
    }
  };
};

/**
 * Combined middleware that checks AND consumes energy in one step
 * Use this for simple cases where you want to validate and consume energy immediately
 * @param energyAmount - Amount of energy to check and consume (default: 1)
 */
export const requireAndConsumeEnergy = (energyAmount: number = 1) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      const consumeResult = await consumeUserEnergy(req.userId, energyAmount);
      
      if (!consumeResult.success) {
        const errorCode = consumeResult.error?.includes('Insufficient') 
          ? 'INSUFFICIENT_ENERGY' 
          : 'ENERGY_CONSUMPTION_FAILED';
        
        res.status(400).json({
          success: false,
          error: {
            code: errorCode,
            message: consumeResult.error || 'Failed to consume energy'
          },
          data: consumeResult.currentEnergy !== undefined ? {
            current_energy: consumeResult.currentEnergy,
            required_energy: energyAmount
          } : undefined
        });
        return;
      }

      // Add energy info to request
      req.energyConsumed = {
        amount: energyAmount,
        remaining: consumeResult.currentEnergy || 0
      };

      next();
    } catch (error) {
      console.error('Energy check and consume middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to process energy requirement'
        }
      });
    }
  };
};

// Extend the AuthenticatedRequest interface to include energy info
declare module '../types' {
  interface AuthenticatedRequest {
    userEnergy?: {
      current: number;
      required: number;
    };
    energyConsumed?: {
      amount: number;
      remaining: number;
    };
  }
}