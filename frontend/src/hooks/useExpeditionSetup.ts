import { useState } from 'react';
import type { Cat } from '../types/Cat';

/**
 * Custom hook for managing expedition setup (cat selection, spread selection)
 */
export const useExpeditionSetup = () => {
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [selectedCats, setSelectedCats] = useState<(Cat | null)[]>([null, null, null]);
  const [showCatSelector, setShowCatSelector] = useState<number | null>(null);

  // Check if all cats are selected
  const allCatsSelected = selectedCats.every(cat => cat !== null);

  // Handle cat slot click
  const handleCatSlotClick = (index: number) => {
    setShowCatSelector(showCatSelector === index ? null : index);
  };

  // Handle cat selection
  const handleCatSelect = (cat: Cat, slotIndex: number) => {
    const newSelectedCats = [...selectedCats];
    newSelectedCats[slotIndex] = cat;
    setSelectedCats(newSelectedCats);
    setShowCatSelector(null);
  };

  // Handle cat removal
  const handleRemoveCat = (index: number) => {
    const newSelectedCats = [...selectedCats];
    newSelectedCats[index] = null;
    setSelectedCats(newSelectedCats);
  };

  // Reset setup state
  const resetSetupState = () => {
    setSelectedCats([null, null, null]);
    setSelectedSpread(null);
    setShowCatSelector(null);
  };

  return {
    // States
    selectedSpread,
    selectedCats,
    showCatSelector,
    allCatsSelected,
    
    // Setters
    setSelectedSpread,
    setSelectedCats,
    setShowCatSelector,
    
    // Actions
    handleCatSlotClick,
    handleCatSelect,
    handleRemoveCat,
    resetSetupState
  };
};