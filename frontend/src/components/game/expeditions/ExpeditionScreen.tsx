import React, { useRef, useEffect } from 'react';
import CardCanvas from '../../animations/CardCanvas';
import Card from '../../animations/Card';
import { Group } from 'react-konva';
import { useCatsStore } from '../../../stores/catsStore';
import { useExpeditionsStore } from '../../../stores/expeditionsStore';
import { expeditionConfig } from '../../../config/expeditionConfig';

// Extracted components
import ExpeditionResults from './ExpeditionResults';
import CardFlipControls from './CardFlipControls';
import ErrorDisplay from '../../shared/ErrorDisplay';
import LoadingDisplay from '../../shared/LoadingDisplay';

// Custom hooks
import { useExpeditionFlow } from '../../../hooks/useExpeditionFlow';

interface ExpeditionScreenProps {
  expeditionId: string;
  onExit: () => void;
}

/**
 * Full-screen expedition experience with no header or footer
 * This is where players actively participate in expeditions
 */
const ExpeditionScreen: React.FC<ExpeditionScreenProps> = ({ expeditionId, onExit }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Custom hooks for state management
  const expeditionFlow = useExpeditionFlow();

  // Store hooks
  const { cats } = useCatsStore();
  const { 
    currentExpedition, 
    completedExpeditionResults,
    completeExpedition, 
    fetchExpedition,
    clearCompletedResults,
    isLoading: expeditionsLoading,
    error: expeditionsError,
    clearError
  } = useExpeditionsStore();

  // Get current canvas dimensions
  const getCanvasDimensions = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: 800, height: 600 };
  };


  // Load expedition data on mount
  useEffect(() => {
    if (expeditionId) {
      fetchExpedition(expeditionId);
    }
  }, [expeditionId, fetchExpedition]);

  // Initialize expedition state for minigame gameplay
  useEffect(() => {
    if (currentExpedition && currentExpedition.cards && currentExpedition.cards.length > 0) {
      // Set up cards for minigame gameplay
      expeditionFlow.setDrawnCards(currentExpedition.cards);
      expeditionFlow.setHasStreamedIn(true);
      
      // If expedition has cards but hasn't been completed, start minigame flow
      if (currentExpedition.expedition.status === 'cards_drawn') {
        expeditionFlow.setAllCardsFlipped(false);
        expeditionFlow.setFlippingCardIndex(0);
        // Cards start at top position ready for flipping
        expeditionFlow.setCardsMovingToTop(false);
      }
      
      // If expedition is completed, show results
      if (currentExpedition.expedition.status === 'completed' && currentExpedition.results) {
        expeditionFlow.setAllCardsFlipped(true);
        expeditionFlow.setFlippingCardIndex(currentExpedition.cards.length);
        expeditionFlow.setShowResults(true);
      }
    }
  }, [currentExpedition]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle expedition completion
  const handleCompleteExpedition = async () => {
    if (!currentExpedition || !currentExpedition.expedition) return;
    if (currentExpedition.expedition.status !== 'active' && currentExpedition.expedition.status !== 'cards_drawn') return;
    
    const result = await completeExpedition(currentExpedition.expedition.id);
    if (result) {
      expeditionFlow.setShowResults(true);
    }
  };

  // Flip the next card in sequence
  const flipNextCard = () => {
    if (expeditionFlow.flippingCardIndex < expeditionFlow.drawnCards.length) {
      const newFlippingIndex = expeditionFlow.flippingCardIndex + 1;
      expeditionFlow.setFlippingCardIndex(newFlippingIndex);
      
      if (newFlippingIndex >= expeditionFlow.drawnCards.length) {
        // Delay setting allCardsFlipped to allow the third card flip animation to complete
        setTimeout(() => {
          expeditionFlow.setAllCardsFlipped(true);
        }, 600); // Wait for flip animation to complete (Card flip takes ~600ms)
      }
    }
  };

  // Handle results close - exit expedition screen
  const handleResultsClose = () => {
    clearCompletedResults();
    onExit();
  };

  // Handle exit button
  const handleExit = () => {
    onExit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900/20 to-purple-950/40">
      {/* Exit button */}
      <button
        onClick={handleExit}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        aria-label="Exit expedition"
      >
        <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Card Flip Controls */}
      <CardFlipControls
        drawnCards={expeditionFlow.drawnCards}
        flippingCardIndex={expeditionFlow.flippingCardIndex}
        cardsStreaming={false}
        deckFading={false}
        cardsMovingToTop={false}
        zoomingToFirstCard={expeditionFlow.zoomingToFirstCard}
        allCardsFlipped={expeditionFlow.allCardsFlipped}
        onFlipNextCard={flipNextCard}
        onCompleteExpedition={handleCompleteExpedition}
      />

      {/* Card canvas - Cards positioned at top for minigame interaction */}
      <div ref={canvasRef} className="relative w-full h-full overflow-hidden">
        <CardCanvas className="w-full h-full">
          {expeditionFlow.drawnCards.length > 0 && (
            <Group>
              {expeditionFlow.drawnCards.map((card, index) => {
                const dimensions = getCanvasDimensions();
                const centerX = dimensions.width * 0.5;
                
                const safeCardPosition = typeof card.cardPosition === 'number' ? card.cardPosition : index;
                const isFirstCard = safeCardPosition === 0;
                const cardScale = expeditionFlow.cardScales[card.id] || 1;
                
                const getUnifiedSpacing = () => {
                  const screenWidth = dimensions.width;
                  const { base, minSpacing, maxSpacing, breakpoint } = expeditionConfig.spacing;
                  const baseSpacing = screenWidth > breakpoint ? maxSpacing : base;
                  const cardWidth = expeditionConfig.cards.top.width;
                  const totalCardsWidth = expeditionFlow.drawnCards.length * cardWidth;
                  const availableSpace = screenWidth * 0.8;
                  const maxPossibleSpacing = (availableSpace - totalCardsWidth) / Math.max(1, expeditionFlow.drawnCards.length - 1);
                  return Math.max(minSpacing, Math.min(baseSpacing, maxPossibleSpacing));
                };
                
                const spacing = getUnifiedSpacing();
                const safeCenterX = isNaN(centerX) ? dimensions.width / 2 : centerX;
                const safeSpacing = isNaN(spacing) ? expeditionConfig.spacing.base : spacing;
                
                let cardX, cardY, cardWidth, cardHeight;
                
                if (expeditionFlow.zoomingToFirstCard && isFirstCard) {
                  // Zoom for minigame interaction
                  cardX = safeCenterX;
                  cardY = dimensions.height * 0.5;
                  cardWidth = expeditionConfig.cards.zoom.width;
                  cardHeight = expeditionConfig.cards.zoom.height;
                } else {
                  // Cards positioned at top for minigame gameplay
                  const offset = (safeCardPosition - (expeditionFlow.drawnCards.length - 1) / 2) * safeSpacing;
                  cardX = safeCenterX + offset;
                  cardY = expeditionConfig.positions.topY;
                  cardWidth = expeditionConfig.cards.top.width;
                  cardHeight = expeditionConfig.cards.top.height;
                }
                
                cardX = isNaN(cardX) ? safeCenterX : cardX;
                cardY = isNaN(cardY) ? expeditionConfig.positions.topY : cardY;
                
                return (
                  <Card
                    key={card.id}
                    x={cardX}
                    y={cardY}
                    width={cardWidth}
                    height={cardHeight}
                    scale={cardScale}
                    animationDuration={expeditionFlow.zoomingToFirstCard && isFirstCard ? expeditionConfig.animation.zoomToMinigame : expeditionConfig.animation.positionTransition}
                    data={{
                      id: card.id,
                      value: card.tarotCardName,
                      suit: '',
                      faceUp: (safeCardPosition < expeditionFlow.flippingCardIndex && safeCardPosition !== expeditionFlow.flippingCardIndex - 1) || expeditionFlow.allCardsFlipped,
                      orientation: card.orientation
                    }}
                    isFlipping={safeCardPosition === expeditionFlow.flippingCardIndex - 1 && expeditionFlow.flippingCardIndex > 0 && expeditionFlow.flippingCardIndex <= expeditionFlow.drawnCards.length && !expeditionFlow.allCardsFlipped}
                    onFlipComplete={() => {}}
                  />
                );
              })}
            </Group>
          )}
        </CardCanvas>

        {/* Loading Display */}
        <LoadingDisplay 
          isLoading={expeditionsLoading} 
          variant="camp"
          message="Loading expedition..." 
        />
        
        {/* Error Display */}
        <ErrorDisplay 
          error={expeditionsError} 
          onDismiss={clearError} 
        />
        
        {/* Expedition Results */}
        <ExpeditionResults
          currentExpedition={completedExpeditionResults || currentExpedition}
          cats={cats}
          showResults={expeditionFlow.showResults}
          onClose={handleResultsClose}
        />
      </div>
    </div>
  );
};

export default ExpeditionScreen;