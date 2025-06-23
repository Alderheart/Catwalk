/**
 * Energy System Utilities Documentation
 * 
 * 1. **Auto-Regeneration**: Energy automatically regenerates when:
 *    - Any API endpoint is called that uses these utilities
 *    - getUserEnergyStatus() is called
 *    - Energy middleware is used
 * 
 * 2. **Database Schema**:
 *    - daily_energy: Current energy (0 to max_daily_energy)
 *    - max_daily_energy: Maximum energy capacity (upgradeable, default: 5)
 *    - energy_regen_rate_minutes: Minutes per energy point (upgradeable, default: 15)
 *    - last_energy_update: Timestamp for regeneration calculations
 * 
 * 3. **Usage Patterns**:
 *    - For simple actions: Use requireAndConsumeEnergy(amount) middleware
 *    - For complex actions: Use requireEnergy(amount) + consumeEnergy(amount)
 *    - For checking only: Use checkUserEnergy() or getUserEnergyStatus()
 * 
 * 4. **API Endpoints Available**:
 *    - GET /auth/profile/energy - Get current energy status
 *    - POST /auth/profile/energy/consume - Manually consume energy
 *    - PATCH /auth/profile/energy/settings - Update max energy or regen rate
 * 
 * 5. **Middleware Integration**:
 *    - Import from '../middleware/energyMiddleware'
 *    - Always use AFTER authMiddleware
 *    - Energy info is added to req.userEnergy and req.energyConsumed
 * 
 * 6. **Error Handling**:
 *    - All functions return success/error states
 *    - INSUFFICIENT_ENERGY errors include current energy amount
 *    - All database errors are logged to console
 * 
 * 7. **Performance Considerations**:
 *    - Energy regeneration calculations are done in-memory (fast)
 *    - Database updates only happen when energy actually changes
 *    - Use getUserEnergyStatus() for efficient energy + regeneration in one call
 */

import { supabase } from './supabase';

export interface EnergyStatus {
  daily_energy: number;
  max_daily_energy: number;
  energy_regen_rate_minutes: number;
  last_energy_update: Date;
  minutes_until_next_energy: number;
  is_at_max: boolean;
}

/**
 * Calculate how much energy should be regenerated based on time passed
 */
export function calculateEnergyRegeneration(
  currentEnergy: number,
  maxEnergy: number,
  regenRateMinutes: number,
  lastUpdateTime: Date,
  currentTime: Date = new Date()
): { newEnergy: number; shouldUpdate: boolean } {
  if (currentEnergy >= maxEnergy) {
    return { newEnergy: currentEnergy, shouldUpdate: false };
  }

  const timeDiff = currentTime.getTime() - lastUpdateTime.getTime();
  const minutesPassed = Math.floor(timeDiff / (1000 * 60));

  if (minutesPassed < regenRateMinutes) {
    return { newEnergy: currentEnergy, shouldUpdate: false };
  }

  const energyToAdd = Math.floor(minutesPassed / regenRateMinutes);
  const newEnergy = Math.min(currentEnergy + energyToAdd, maxEnergy);
  
  return { 
    newEnergy, 
    shouldUpdate: newEnergy > currentEnergy 
  };
}

/**
 * Calculate minutes until next energy regeneration
 */
export function calculateMinutesUntilNextEnergy(
  currentEnergy: number,
  maxEnergy: number,
  regenRateMinutes: number,
  lastUpdateTime: Date,
  currentTime: Date = new Date()
): number {
  if (currentEnergy >= maxEnergy) {
    return 0;
  }

  const timeDiff = currentTime.getTime() - lastUpdateTime.getTime();
  const minutesPassed = Math.floor(timeDiff / (1000 * 60));
  
  return regenRateMinutes - (minutesPassed % regenRateMinutes);
}

/**
 * Get and update user's energy status with automatic regeneration
 * 
 * This is the main function to use when you need current energy info.
 * It automatically calculates and applies energy regeneration.
 */
export async function getUserEnergyStatus(userId: string): Promise<EnergyStatus | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('daily_energy, max_daily_energy, energy_regen_rate_minutes, last_energy_update')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    const now = new Date();
    const lastUpdate = new Date(user.last_energy_update);
    
    const { newEnergy, shouldUpdate } = calculateEnergyRegeneration(
      user.daily_energy,
      user.max_daily_energy,
      user.energy_regen_rate_minutes,
      lastUpdate,
      now
    );

    // Update database if energy changed
    if (shouldUpdate) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          daily_energy: newEnergy,
          last_energy_update: now.toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user energy:', updateError);
      }
    }

    const minutesUntilNext = calculateMinutesUntilNextEnergy(
      newEnergy,
      user.max_daily_energy,
      user.energy_regen_rate_minutes,
      shouldUpdate ? now : lastUpdate,
      now
    );

    return {
      daily_energy: newEnergy,
      max_daily_energy: user.max_daily_energy,
      energy_regen_rate_minutes: user.energy_regen_rate_minutes,
      last_energy_update: shouldUpdate ? now : lastUpdate,
      minutes_until_next_energy: minutesUntilNext,
      is_at_max: newEnergy >= user.max_daily_energy
    };
  } catch (error) {
    console.error('Error getting user energy status:', error);
    return null;
  }
}

/**
 * Consume energy for a user action
 * 
 * Use this when you want to immediately deduct energy.
 * It automatically handles energy regeneration before consuming.
 */
export async function consumeUserEnergy(
  userId: string, 
  amount: number = 1
): Promise<{ success: boolean; currentEnergy?: number; error?: string }> {
  try {
    // First get current energy status
    const energyStatus = await getUserEnergyStatus(userId);
    
    if (!energyStatus) {
      return { success: false, error: 'User not found' };
    }

    // Check if user has enough energy
    if (energyStatus.daily_energy < amount) {
      return { 
        success: false, 
        error: `Insufficient energy. Required: ${amount}, Available: ${energyStatus.daily_energy}`,
        currentEnergy: energyStatus.daily_energy
      };
    }

    // Consume energy
    const newEnergy = energyStatus.daily_energy - amount;
    const { error } = await supabase
      .from('users')
      .update({
        daily_energy: newEnergy,
        last_energy_update: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: 'Failed to update energy' };
    }

    return { success: true, currentEnergy: newEnergy };
  } catch (error) {
    console.error('Error consuming user energy:', error);
    return { success: false, error: 'Server error' };
  }
}

/**
 * Check if user has enough energy for an action (without consuming)
 * 
 * Use this for validation without actually deducting energy.
 * Energy regeneration is automatically applied.
 */
export async function checkUserEnergy(
  userId: string, 
  requiredAmount: number = 1
): Promise<{ hasEnough: boolean; currentEnergy: number; error?: string }> {
  try {
    const energyStatus = await getUserEnergyStatus(userId);
    
    if (!energyStatus) {
      return { hasEnough: false, currentEnergy: 0, error: 'User not found' };
    }

    return {
      hasEnough: energyStatus.daily_energy >= requiredAmount,
      currentEnergy: energyStatus.daily_energy
    };
  } catch (error) {
    console.error('Error checking user energy:', error);
    return { hasEnough: false, currentEnergy: 0, error: 'Server error' };
  }
}