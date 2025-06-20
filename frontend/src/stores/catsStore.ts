import { create } from 'zustand';
import type { Cat } from '../types/Cat';
import { catsService, CreateCatData, UpdateCatData } from '../services/catsService';
import { useCatPositionsStore } from './catPositionsStore';

interface CatsState {
  cats: Cat[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchCats: (force?: boolean) => Promise<void>;
  createCat: (data: CreateCatData) => Promise<boolean>;
  updateCat: (catId: string, data: UpdateCatData) => Promise<boolean>;
  deleteCat: (catId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useCatsStore = create<CatsState>((set, get) => ({
  cats: [],
  isLoading: false,
  error: null,
  lastFetch: null,

  fetchCats: async (force = false) => {
    const state = get();
    const now = Date.now();
    const cacheExpiry = 2 * 60 * 1000; // 2 minutes cache
    
    // Skip fetch if we have recent data and not forcing
    if (!force && state.lastFetch && (now - state.lastFetch) < cacheExpiry && state.cats.length > 0) {
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await catsService.getCats();
      
      if (response.success && response.data) {
        set({
          cats: response.data,
          isLoading: false,
          error: null,
          lastFetch: now,
        });
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to fetch cats',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
    }
  },

  createCat: async (data: CreateCatData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await catsService.createCat(data);
      
      if (response.success && response.data) {
        // Add the new cat to the current list
        const currentCats = get().cats;
        set({
          cats: [...currentCats, response.data],
          isLoading: false,
          error: null,
          lastFetch: Date.now(), // Update cache timestamp
        });
        // New cat will get a position when placement hook runs
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to create cat',
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

  updateCat: async (catId: string, data: UpdateCatData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await catsService.updateCat(catId, data);
      
      if (response.success && response.data) {
        // Update the cat in the current list
        const currentCats = get().cats;
        const updatedCats = currentCats.map(cat => 
          cat.id === catId ? response.data! : cat
        );
        
        set({
          cats: updatedCats,
          isLoading: false,
          error: null,
          lastFetch: Date.now(), // Update cache timestamp
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to update cat',
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

  deleteCat: async (catId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await catsService.deleteCat(catId);
      
      if (response.success) {
        // Remove the cat from the current list
        const currentCats = get().cats;
        const filteredCats = currentCats.filter(cat => cat.id !== catId);
        
        // Remove cached position for deleted cat
        useCatPositionsStore.getState().removePosition(catId);
        
        set({
          cats: filteredCats,
          isLoading: false,
          error: null,
          lastFetch: Date.now(), // Update cache timestamp
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Failed to delete cat',
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

  clearError: () => {
    set({ error: null });
  },
}));