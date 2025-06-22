import { create } from 'zustand';
import { 
  expeditionsService, 
  Expedition, 
  CompleteExpeditionData, 
  CreateExpeditionRequest 
} from '../services/expeditionsService';

interface ExpeditionsState {
  expeditions: Expedition[];
  currentExpedition: CompleteExpeditionData | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchExpeditions: (force?: boolean) => Promise<void>;
  fetchCurrentExpedition: () => Promise<void>;
  createExpedition: (data: CreateExpeditionRequest) => Promise<boolean>;
  completeExpedition: (expeditionId: string) => Promise<CompleteExpeditionData | null>;
  clearError: () => void;
  clearCurrentExpedition: () => void;
}

export const useExpeditionsStore = create<ExpeditionsState>((set, get) => ({
  expeditions: [],
  currentExpedition: null,
  isLoading: false,
  error: null,
  lastFetch: null,

  fetchExpeditions: async (force = false) => {
    const state = get();
    const now = Date.now();
    const cacheExpiry = 2 * 60 * 1000; // 2 minutes cache
    
    // Skip fetch if we have recent data and not forcing
    if (!force && state.lastFetch && (now - state.lastFetch) < cacheExpiry && state.expeditions.length > 0) {
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await expeditionsService.getExpeditions();
      
      if (response.success && response.data) {
        set({
          expeditions: response.data,
          isLoading: false,
          error: null,
          lastFetch: now,
        });
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to fetch expeditions',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
    }
  },

  fetchCurrentExpedition: async () => {
    const state = get();
    
    // First check if we have expeditions loaded
    if (state.expeditions.length === 0) {
      await get().fetchExpeditions();
    }
    
    // Look for active or cards_drawn expedition
    const activeExpedition = get().expeditions.find(exp => exp.status === 'active' || exp.status === 'cards_drawn');
    
    if (!activeExpedition) {
      set({ currentExpedition: null });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await expeditionsService.getExpedition(activeExpedition.id);
      
      if (response.success && response.data) {
        set({
          currentExpedition: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to fetch current expedition',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
    }
  },

  createExpedition: async (data: CreateExpeditionRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await expeditionsService.createExpedition(data);
      
      if (response.success && response.data) {
        // Add the new expedition to the list
        const currentExpeditions = get().expeditions;
        set({
          expeditions: [response.data.expedition, ...currentExpeditions],
          currentExpedition: response.data,
          isLoading: false,
          error: null,
          lastFetch: Date.now(),
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to create expedition',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
      return false;
    }
  },

  completeExpedition: async (expeditionId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await expeditionsService.completeExpedition(expeditionId);
      
      if (response.success && response.data) {
        // Update the expedition in the list
        const currentExpeditions = get().expeditions;
        const updatedExpeditions = currentExpeditions.map(exp => 
          exp.id === expeditionId ? response.data!.expedition : exp
        );
        
        set({
          expeditions: updatedExpeditions,
          currentExpedition: response.data,
          isLoading: false,
          error: null,
          lastFetch: Date.now(),
        });
        return response.data;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to complete expedition',
        });
        return null;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentExpedition: () => {
    set({ currentExpedition: null });
  },
}));