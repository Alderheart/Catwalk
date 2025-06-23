import { create } from 'zustand';
import { energyService, EnergyStatus } from '../services/energyService';

interface EnergyState {
  currentEnergy: number;
  maxEnergy: number;
  regenRateMinutes: number;
  minutesUntilNext: number;
  isAtMax: boolean;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchEnergyStatus: (force?: boolean) => Promise<void>;
  consumeEnergy: (amount?: number) => Promise<boolean>;
  updateEnergySettings: (settings: { max_daily_energy?: number; energy_regen_rate_minutes?: number }) => Promise<void>;
  clearError: () => void;
}

export const useEnergyStore = create<EnergyState>((set, get) => ({
  currentEnergy: 0,
  maxEnergy: 5,
  regenRateMinutes: 15,
  minutesUntilNext: 0,
  isAtMax: false,
  isLoading: false,
  error: null,
  lastFetch: null,

  fetchEnergyStatus: async (force = false) => {
    const state = get();
    const now = Date.now();
    const cacheExpiry = 30 * 1000; // 30 seconds cache for energy (shorter than other stores)
    
    // Skip fetch if we have recent data and not forcing
    if (!force && state.lastFetch && (now - state.lastFetch) < cacheExpiry) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      console.log('🔋 Fetching energy status...');
      const energyStatus = await energyService.getEnergyStatus();
      console.log('🔋 Energy status received:', energyStatus);
      
      set({
        currentEnergy: energyStatus.currentEnergy,
        maxEnergy: energyStatus.maxEnergy,
        regenRateMinutes: energyStatus.regenRateMinutes,
        minutesUntilNext: energyStatus.minutesUntilNext,
        isAtMax: energyStatus.isAtMax,
        isLoading: false,
        error: null,
        lastFetch: now,
      });
    } catch (error) {
      console.error('🔋 Energy fetch error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch energy status',
      });
    }
  },

  consumeEnergy: async (amount = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      const energyStatus = await energyService.consumeEnergy(amount);
      
      set({
        currentEnergy: energyStatus.currentEnergy,
        maxEnergy: energyStatus.maxEnergy,
        regenRateMinutes: energyStatus.regenRateMinutes,
        minutesUntilNext: energyStatus.minutesUntilNext,
        isAtMax: energyStatus.isAtMax,
        isLoading: false,
        error: null,
        lastFetch: Date.now(),
      });
      
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to consume energy',
      });
      return false;
    }
  },

  updateEnergySettings: async (settings) => {
    set({ isLoading: true, error: null });
    
    try {
      const energyStatus = await energyService.updateEnergySettings(settings);
      
      set({
        currentEnergy: energyStatus.currentEnergy,
        maxEnergy: energyStatus.maxEnergy,
        regenRateMinutes: energyStatus.regenRateMinutes,
        minutesUntilNext: energyStatus.minutesUntilNext,
        isAtMax: energyStatus.isAtMax,
        isLoading: false,
        error: null,
        lastFetch: Date.now(),
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update energy settings',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));