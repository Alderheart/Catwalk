import React, { useRef, useEffect } from 'react';
import CardCanvas from '../../animations/CardCanvas';
import CardDeck, { CardDeckHandle } from '../../animations/CardDeck';
import Card, { CardData } from '../../animations/Card';
import { Group } from 'react-konva';
import { useCatsStore } from '../../../stores/catsStore';
import { useExpeditionsStore } from '../../../stores/expeditionsStore';
import { useTabBarStore } from '../../../stores/tabBarStore';
import { expeditionConfig } from '../../../config/expeditionConfig';

// Extracted components
import ExpeditionResults from './ExpeditionResults';
import ExpeditionSetup from './ExpeditionSetup';
import CardFlipControls from './CardFlipControls';
import ErrorDisplay from '../../shared/ErrorDisplay';
import LoadingDisplay from '../../shared/LoadingDisplay';

// Custom hooks
import { useExpeditionFlow } from '../../../hooks/useExpeditionFlow';
import { useExpeditionSetup } from '../../../hooks/useExpeditionSetup';

/**
 * Expeditions page with card spread selection
 * Full page experience with no bottom nav bar
 */
const ExpeditionsPage: React.FC = () => {
  const deckRef = useRef<CardDeckHandle>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Custom hooks for state management
  const expeditionFlow = useExpeditionFlow();
  const expeditionSetup = useExpeditionSetup();

  // Store hooks
  const { cats, fetchCats } = useCatsStore();
  const { 
    currentExpedition, 
    createExpedition,
    drawCards, 
    completeExpedition, 
    fetchCurrentExpedition,
    clearCurrentExpedition,
    isLoading: expeditionsLoading,
    error: expeditionsError,
    clearError
  } = useExpeditionsStore();
  const { setActiveTab } = useTabBarStore();

  // Get current canvas dimensions
  const getCanvasDimensions = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: 800, height: 600 };
  };

  // Create expedition cards deck
  const getExpeditionCards = (): CardData[] => {
    if (expeditionFlow.cardsStreaming || expeditionFlow.deckFading) {
      const fullDeck = Array.from({ length: 12 }, (_, i) => ({
        id: `expedition-card-${i}`,
        value: i < expeditionFlow.drawnCards.length ? expeditionFlow.drawnCards[i].tarotCardName : ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice'][i],
        suit: '',
        faceUp: false,
        orientation: i < expeditionFlow.drawnCards.length ? expeditionFlow.drawnCards[i].orientation : 'upright'
      }));
      return fullDeck;
    }
    
    if (expeditionFlow.drawnCards.length > 0) {
      return expeditionFlow.drawnCards.map((card, i) => ({
        id: `expedition-card-${i}`,
        value: card.tarotCardName,
        suit: '',
        faceUp: i < expeditionFlow.flippingCardIndex || expeditionFlow.allCardsFlipped,
        orientation: card.orientation
      }));
    }
    
    if (currentExpedition?.cards && currentExpedition.cards.length > 0) {
      return currentExpedition.cards.map((card, i) => ({
        id: `expedition-card-${i}`,
        value: card.tarotCardName,
        suit: '',
        faceUp: true,
        orientation: card.orientation
      }));
    }
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `expedition-card-${i}`,
      value: ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice'][i],
      suit: '',
      faceUp: false
    }));
  };

  // Initialize deck streaming animation
  useEffect(() => {
    if (!expeditionFlow.hasStreamedIn && !currentExpedition) {
      const dimensions = getCanvasDimensions();
      expeditionFlow.setDeckPosition({
        x: dimensions.width * 0.5,
        y: dimensions.height + 100
      });

      setTimeout(() => {
        if (deckRef.current) {
          deckRef.current.streamTo(dimensions.width * 0.5, dimensions.height * 0.6, () => {
            expeditionFlow.setHasStreamedIn(true);
            expeditionFlow.setShowSpreadMenu(true);
          });
        }
      }, 500);
    }
  }, [expeditionFlow.hasStreamedIn, currentExpedition]);

  // Load data on mount
  useEffect(() => {
    fetchCats();
    fetchCurrentExpedition();
  }, [fetchCats, fetchCurrentExpedition]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Auto-show results when expedition is completed
  useEffect(() => {
    if (currentExpedition && currentExpedition.expedition && currentExpedition.expedition.status === 'completed' && currentExpedition.results) {
      expeditionFlow.setShowResults(true);
    }
  }, [currentExpedition]);

  // Handle expedition creation
  const handleBeginExpedition = async () => {
    if (!expeditionSetup.selectedSpread || !expeditionSetup.allCatsSelected) return;
    
    expeditionFlow.setIsCreatingExpedition(true);
    
    const catIds = expeditionSetup.selectedCats.filter(cat => cat !== null).map(cat => cat!.id);
    
    const expedition = await createExpedition({
      spreadType: expeditionSetup.selectedSpread as 'three-card' | 'horseshoe' | 'four-directions',
      catIds
    });
    
    if (expedition) {
      const cards = await drawCards(expedition.expedition.id);
      
      if (cards) {
        expeditionSetup.resetSetupState();
        expeditionFlow.setShowSpreadMenu(false);
        expeditionFlow.setDrawnCards(cards);
        expeditionFlow.setCardsStreaming(true);
        expeditionFlow.setDeckFading(true);
        
        const dimensions = getCanvasDimensions();
        const centerX = dimensions.width * 0.5;
        const centerY = dimensions.height * 0.4;
        
        const calculateUnifiedSpacing = () => {
          const screenWidth = dimensions.width;
          const { base, minSpacing, maxSpacing, breakpoint } = expeditionConfig.spacing;
          const baseSpacing = screenWidth > breakpoint ? maxSpacing : base;
          const cardWidth = expeditionConfig.cards.center.width;
          const totalCardsWidth = 3 * cardWidth;
          const availableSpace = screenWidth * 0.8;
          const maxPossibleSpacing = (availableSpace - totalCardsWidth) / Math.max(1, 3 - 1);
          return Math.max(minSpacing, Math.min(baseSpacing, maxPossibleSpacing));
        };
        
        const cardSpacing = calculateUnifiedSpacing();
        
        deckRef.current?.streamToSpread(centerX, centerY, cardSpacing, () => {
          expeditionFlow.setCardsStreaming(false);
          expeditionFlow.setDeckFading(false);
          setTimeout(() => {
            expeditionFlow.setCardsMovingToTop(true);
            setTimeout(() => {
              expeditionFlow.setCardsMovingToTop(false);
            }, expeditionConfig.animation.positionTransition);
          }, 500);
        });
      }
    }
    
    expeditionFlow.setIsCreatingExpedition(false);
  };

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
        expeditionFlow.setAllCardsFlipped(true);
        setTimeout(() => {
          if (currentExpedition && currentExpedition.expedition && currentExpedition.expedition.status === 'cards_drawn') {
            handleCompleteExpedition();
          }
        }, 1000);
      }
    }
  };

  // Handle new expedition
  const handleNewExpedition = () => {
    clearCurrentExpedition();
    expeditionFlow.resetExpeditionFlow();
    expeditionSetup.resetSetupState();
    expeditionFlow.setShowSpreadMenu(false);
    
    const dimensions = getCanvasDimensions();
    expeditionFlow.setDeckPosition({
      x: dimensions.width * 0.5,
      y: dimensions.height + 100
    });
  };

  // Handle back navigation
  const handleBack = () => {
    setActiveTab('camp');
  };

  const expeditionCards = getExpeditionCards();

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-purple-900/20 to-purple-950/40">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm backdrop-blur-sm"
      >
        <span>←</span>
        Back to Camp
      </button>

      {/* Card Flip Controls */}
      <CardFlipControls
        drawnCards={expeditionFlow.drawnCards}
        flippingCardIndex={expeditionFlow.flippingCardIndex}
        cardsStreaming={expeditionFlow.cardsStreaming}
        deckFading={expeditionFlow.deckFading}
        cardsMovingToTop={expeditionFlow.cardsMovingToTop}
        zoomingToFirstCard={expeditionFlow.zoomingToFirstCard}
        allCardsFlipped={expeditionFlow.allCardsFlipped}
        onFlipNextCard={flipNextCard}
      />

      {/* Card canvas */}
      <div ref={canvasRef} className="relative w-full h-full overflow-hidden">
        <CardCanvas className="w-full h-full">
          {expeditionFlow.drawnCards.length > 0 && !expeditionFlow.cardsStreaming && !expeditionFlow.deckFading ? (
            <Group>
              {expeditionFlow.drawnCards.map((card, index) => {
                const dimensions = getCanvasDimensions();
                const centerX = dimensions.width * 0.5;
                const centerY = dimensions.height * expeditionConfig.positions.centerY;
                
                const safeCardPosition = typeof card.cardPosition === 'number' ? card.cardPosition : index;
                const isFirstCard = safeCardPosition === 0;
                const cardScale = expeditionFlow.cardScales[card.id] || 1;
                
                const getUnifiedSpacing = () => {
                  const screenWidth = dimensions.width;
                  const { base, minSpacing, maxSpacing, breakpoint } = expeditionConfig.spacing;
                  const baseSpacing = screenWidth > breakpoint ? maxSpacing : base;
                  const cardWidth = expeditionConfig.cards.center.width;
                  const totalCardsWidth = expeditionFlow.drawnCards.length * cardWidth;
                  const availableSpace = screenWidth * 0.8;
                  const maxPossibleSpacing = (availableSpace - totalCardsWidth) / Math.max(1, expeditionFlow.drawnCards.length - 1);
                  return Math.max(minSpacing, Math.min(baseSpacing, maxPossibleSpacing));
                };
                
                const spacing = getUnifiedSpacing();
                const safeCenterX = isNaN(centerX) ? dimensions.width / 2 : centerX;
                const safeCenterY = isNaN(centerY) ? dimensions.height / 2 : centerY;
                const safeSpacing = isNaN(spacing) ? expeditionConfig.spacing.base : spacing;
                
                let cardX, cardY, cardWidth, cardHeight;
                
                if (expeditionFlow.zoomingToFirstCard && isFirstCard) {
                  cardX = safeCenterX;
                  cardY = safeCenterY;
                  cardWidth = expeditionConfig.cards.zoom.width;
                  cardHeight = expeditionConfig.cards.zoom.height;
                } else if (expeditionFlow.cardsMovingToTop || expeditionFlow.flippingCardIndex > 0 || expeditionFlow.allCardsFlipped || (!expeditionFlow.cardsStreaming && !expeditionFlow.deckFading)) {
                  const offset = (safeCardPosition - (expeditionFlow.drawnCards.length - 1) / 2) * safeSpacing;
                  cardX = safeCenterX + offset;
                  cardY = expeditionConfig.positions.topY;
                  cardWidth = expeditionConfig.cards.top.width;
                  cardHeight = expeditionConfig.cards.top.height;
                } else {
                  const offset = (safeCardPosition - (expeditionFlow.drawnCards.length - 1) / 2) * safeSpacing;
                  cardX = safeCenterX + offset;
                  cardY = safeCenterY + expeditionConfig.positions.centerOffset;
                  cardWidth = expeditionConfig.cards.center.width;
                  cardHeight = expeditionConfig.cards.center.height;
                }
                
                cardX = isNaN(cardX) ? safeCenterX : cardX;
                cardY = isNaN(cardY) ? safeCenterY : cardY;
                
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
          ) : (
            expeditionFlow.deckPosition && (expeditionFlow.cardsStreaming || expeditionFlow.deckFading || expeditionFlow.drawnCards.length === 0) && (
              <CardDeck
                ref={deckRef}
                cards={expeditionCards}
                deckX={expeditionFlow.deckPosition.x}
                deckY={expeditionFlow.deckPosition.y}
              />
            )
          )}
        </CardCanvas>

        {/* Loading Display */}
        <LoadingDisplay 
          isLoading={expeditionsLoading} 
          message="Loading expedition..." 
        />
        
        {/* Error Display */}
        <ErrorDisplay 
          error={expeditionsError} 
          onDismiss={clearError} 
        />
        
        {/* Expedition Results */}
        <ExpeditionResults
          currentExpedition={currentExpedition}
          cats={cats}
          showResults={expeditionFlow.showResults}
          onNewExpedition={handleNewExpedition}
          onBackToCamp={handleBack}
        />
        
        {/* Expedition Setup */}
        <ExpeditionSetup
          selectedCats={expeditionSetup.selectedCats}
          selectedSpread={expeditionSetup.selectedSpread}
          showSpreadMenu={expeditionFlow.showSpreadMenu}
          showCatSelector={expeditionSetup.showCatSelector}
          currentExpedition={currentExpedition}
          drawnCards={expeditionFlow.drawnCards}
          isCreatingExpedition={expeditionFlow.isCreatingExpedition}
          expeditionsLoading={expeditionsLoading}
          cats={cats}
          onCatSlotClick={expeditionSetup.handleCatSlotClick}
          onCatSelect={expeditionSetup.handleCatSelect}
          onRemoveCat={expeditionSetup.handleRemoveCat}
          onCancelCatSelection={() => expeditionSetup.setShowCatSelector(null)}
          onSpreadSelect={expeditionSetup.setSelectedSpread}
          onBeginExpedition={handleBeginExpedition}
        />
      </div>
    </div>
  );
};

export default ExpeditionsPage;