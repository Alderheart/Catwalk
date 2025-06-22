import { useState } from 'react';
import { ExpeditionCard } from '../services/expeditionsService';

/**
 * Custom hook for managing expedition flow state
 */
export const useExpeditionFlow = () => {
  // Animation and flow states
  const [hasStreamedIn, setHasStreamedIn] = useState(false);
  const [showSpreadMenu, setShowSpreadMenu] = useState(false);
  const [cardsStreaming, setCardsStreaming] = useState(false);
  const [deckFading, setDeckFading] = useState(false);
  const [cardsMovingToTop, setCardsMovingToTop] = useState(false);
  const [flippingCardIndex, setFlippingCardIndex] = useState<number>(0);
  const [allCardsFlipped, setAllCardsFlipped] = useState(false);
  const [zoomingToFirstCard, setZoomingToFirstCard] = useState(false);
  const [cardScales, setCardScales] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  
  // Data states
  const [drawnCards, setDrawnCards] = useState<ExpeditionCard[]>([]);
  const [deckPosition, setDeckPosition] = useState<{ x: number; y: number } | null>(null);
  
  // UI states
  const [isCreatingExpedition, setIsCreatingExpedition] = useState(false);

  const resetExpeditionFlow = () => {
    setShowResults(false);
    setHasStreamedIn(false);
    setDeckFading(false);
    setCardsStreaming(false);
    setDrawnCards([]);
    setFlippingCardIndex(0);
    setAllCardsFlipped(false);
    setZoomingToFirstCard(false);
    setCardScales({});
    setCardsMovingToTop(false);
  };

  return {
    // States
    hasStreamedIn,
    showSpreadMenu,
    cardsStreaming,
    deckFading,
    cardsMovingToTop,
    flippingCardIndex,
    allCardsFlipped,
    zoomingToFirstCard,
    cardScales,
    showResults,
    drawnCards,
    deckPosition,
    isCreatingExpedition,
    
    // Setters
    setHasStreamedIn,
    setShowSpreadMenu,
    setCardsStreaming,
    setDeckFading,
    setCardsMovingToTop,
    setFlippingCardIndex,
    setAllCardsFlipped,
    setZoomingToFirstCard,
    setCardScales,
    setShowResults,
    setDrawnCards,
    setDeckPosition,
    setIsCreatingExpedition,
    
    // Actions
    resetExpeditionFlow
  };
};