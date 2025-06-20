import { create } from 'zustand';

export interface CatPosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  mirrored: boolean;
  spriteUrl: string;
}

interface CatPositionsState {
  positions: Record<string, CatPosition>;
  
  // Actions
  getPosition: (catId: string) => CatPosition | undefined;
  setPosition: (catId: string, position: CatPosition) => void;
  clearPositions: () => void;
  removePosition: (catId: string) => void;
}

export const useCatPositionsStore = create<CatPositionsState>((set, get) => ({
  positions: {},
  
  getPosition: (catId: string) => {
    return get().positions[catId];
  },
  
  setPosition: (catId: string, position: CatPosition) => {
    set((state) => ({
      positions: {
        ...state.positions,
        [catId]: position
      }
    }));
  },
  
  clearPositions: () => {
    set({ positions: {} });
  },
  
  removePosition: (catId: string) => {
    set((state) => {
      const newPositions = { ...state.positions };
      delete newPositions[catId];
      return { positions: newPositions };
    });
  },
}));