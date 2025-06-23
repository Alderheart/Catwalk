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
  onCompleteExpedition: () => void;
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
  onFlipNextCard,
  onCompleteExpedition
}) => {
  // Show completion button when all cards are flipped but expedition not completed
  const showCompletionButton = drawnCards.length > 0 && 
                               !cardsStreaming && 
                               !deckFading && 
                               !cardsMovingToTop && 
                               !zoomingToFirstCard && 
                               allCardsFlipped &&
                               flippingCardIndex >= drawnCards.length;

  // Show flip button when cards are ready for flipping and not all flipped
  const showFlipButton = drawnCards.length > 0 && 
                         !cardsStreaming && 
                         !deckFading && 
                         !cardsMovingToTop && 
                         !zoomingToFirstCard && 
                         !allCardsFlipped &&
                         flippingCardIndex < drawnCards.length;

  if (showCompletionButton) {
    return (
      <button
        onClick={onCompleteExpedition}
        className="absolute top-4 right-4 z-10 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm backdrop-blur-sm"
      >
        Complete Expedition
      </button>
    );
  }

  if (showFlipButton) {
    const nextCardName = drawnCards[flippingCardIndex]?.tarotCardName || 'Next Card';

    return (
      <button
        onClick={onFlipNextCard}
        className="absolute top-4 right-4 z-10 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm backdrop-blur-sm"
      >
        Flip {nextCardName} ({flippingCardIndex + 1}/{drawnCards.length})
      </button>
    );
  }

  return null;
};

export default CardFlipControls;