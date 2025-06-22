import React from 'react';
import { ExpeditionCard } from '../../../services/expeditionsService';

interface CardFlipControlsProps {
  drawnCards: ExpeditionCard[];
  flippingCardIndex: number;
  cardsStreaming: boolean;
  deckFading: boolean;
  cardsMovingToTop: boolean;
  zoomingToFirstCard: boolean;
  allCardsFlipped: boolean;
  onFlipNextCard: () => void;
}

/**
 * Controls for manually flipping expedition cards
 */
const CardFlipControls: React.FC<CardFlipControlsProps> = ({
  drawnCards,
  flippingCardIndex,
  cardsStreaming,
  deckFading,
  cardsMovingToTop,
  zoomingToFirstCard,
  allCardsFlipped,
  onFlipNextCard
}) => {
  // Only show button when cards are ready for flipping
  const shouldShow = drawnCards.length > 0 && 
                     !cardsStreaming && 
                     !deckFading && 
                     !cardsMovingToTop && 
                     !zoomingToFirstCard && 
                     !allCardsFlipped;

  if (!shouldShow) {
    return null;
  }

  const nextCardName = drawnCards[flippingCardIndex]?.tarotCardName || 'Next Card';

  return (
    <button
      onClick={onFlipNextCard}
      className="absolute top-4 right-4 z-10 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm backdrop-blur-sm"
    >
      Flip {nextCardName} ({flippingCardIndex + 1}/{drawnCards.length})
    </button>
  );
};

export default CardFlipControls;