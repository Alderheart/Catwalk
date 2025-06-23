import React, { useRef, useEffect } from 'react';
import CardCanvas from '../../animations/CardCanvas';
import CardDeck, { CardDeckHandle } from '../../animations/CardDeck';
import { CardData } from '../../animations/Card';
import { useCatsStore } from '../../../stores/catsStore';
import { useExpeditionsStore } from '../../../stores/expeditionsStore';
import { expeditionConfig } from '../../../config/expeditionConfig';
import CatSpriteBox from '../../ui/CatSpriteBox';

// Extracted components
import ExpeditionResults from './ExpeditionResults';
import ExpeditionSetup from './ExpeditionSetup';
import ErrorDisplay from '../../shared/ErrorDisplay';
import LoadingDisplay from '../../shared/LoadingDisplay';

// Custom hooks
import { useExpeditionFlow } from '../../../hooks/useExpeditionFlow';
import { useExpeditionSetup } from '../../../hooks/useExpeditionSetup';

interface ExpeditionsPageProps {
  onEnterExpedition: (expeditionId: string) => void;
}

/**
 * Expeditions page with card spread selection
 * Full page experience with no bottom nav bar
 */
const ExpeditionsPage: React.FC<ExpeditionsPageProps> = ({ onEnterExpedition }) => {
  const deckRef = useRef<CardDeckHandle>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Custom hooks for state management
  const expeditionFlow = useExpeditionFlow();
  const expeditionSetup = useExpeditionSetup();

  // Store hooks
  const { cats, fetchCats } = useCatsStore();
  const { 
    currentExpedition, 
    lastCompletedExpedition,
    createExpedition,
    drawCards, 
    fetchCurrentExpedition,
    fetchLastCompletedExpedition,
    clearCurrentExpedition,
    completeExpedition,
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
    fetchLastCompletedExpedition();
  }, [fetchCats, fetchCurrentExpedition, fetchLastCompletedExpedition]);

  // Check expedition state to determine what to show
  const hasActiveExpedition = currentExpedition && 
    currentExpedition.expedition &&
    (currentExpedition.expedition.status === 'active' || currentExpedition.expedition.status === 'cards_drawn');

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Results are shown only when explicitly triggered by completion handler
  // No auto-show on page revisits

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
      // Draw cards immediately for the new expedition
      const cards = await drawCards(expedition.expedition.id);
      
      if (cards) {
        // Reset setup state and navigate to expedition screen with cards ready
        expeditionSetup.resetSetupState();
        expeditionFlow.resetExpeditionFlow();
        onEnterExpedition(expedition.expedition.id);
      }
    }
    
    expeditionFlow.setIsCreatingExpedition(false);
  };

  // Handle continuing an active expedition
  const handleContinueExpedition = async () => {
    if (!hasActiveExpedition) return;
    
    // If expedition is active but no cards drawn yet, draw them first
    if (currentExpedition.expedition.status === 'active' && (!currentExpedition.cards || currentExpedition.cards.length === 0)) {
      const cards = await drawCards(currentExpedition.expedition.id);
      if (cards) {
        onEnterExpedition(currentExpedition.expedition.id);
      }
    } else if (currentExpedition.expedition.status === 'cards_drawn') {
      // Cards are ready, go to minigame screen
      onEnterExpedition(currentExpedition.expedition.id);
    }
  };

  // Handle ending expedition early
  const handleEndExpedition = async () => {
    if (!currentExpedition) return;
    
    await completeExpedition(currentExpedition.expedition.id);
    
    // Reset flow and setup state
    expeditionFlow.resetExpeditionFlow();
    expeditionSetup.resetSetupState();
    
    const dimensions = getCanvasDimensions();
    expeditionFlow.setDeckPosition({
      x: dimensions.width * 0.5,
      y: dimensions.height + 100
    });
    
    // Auto-show setup menu after ending expedition
    setTimeout(() => {
      if (deckRef.current) {
        deckRef.current.streamTo(dimensions.width * 0.5, dimensions.height * 0.6, () => {
          expeditionFlow.setHasStreamedIn(true);
          expeditionFlow.setShowSpreadMenu(true);
        });
      }
    }, 500);
  };

  // Handle results close - clear expedition and show setup menu
  const handleResultsClose = () => {
    clearCurrentExpedition();
    expeditionFlow.resetExpeditionFlow();
    expeditionSetup.resetSetupState();
    
    const dimensions = getCanvasDimensions();
    expeditionFlow.setDeckPosition({
      x: dimensions.width * 0.5,
      y: dimensions.height + 100
    });
    
    // Auto-show setup menu after closing results
    setTimeout(() => {
      if (deckRef.current) {
        deckRef.current.streamTo(dimensions.width * 0.5, dimensions.height * 0.6, () => {
          expeditionFlow.setHasStreamedIn(true);
          expeditionFlow.setShowSpreadMenu(true);
        });
      }
    }, 500);
  };


  const expeditionCards = getExpeditionCards();

  // Get expedition cats if there's an active expedition
  const getExpeditionCats = () => {
    if (!hasActiveExpedition || !currentExpedition?.cats || !cats.length) {
      return [];
    }
    
    // Create array of cats in their proper positions (0, 1, 2)
    const positionedCats = new Array(3).fill(null);
    
    currentExpedition.cats.forEach(expCat => {
      // Try different possible field names for cat ID
      const catId = expCat.catId || expCat.cat_id || expCat.id;
      const position = expCat.position !== undefined ? expCat.position : expCat.pos;
      
      const foundCat = cats.find(cat => cat.id === catId);
      if (foundCat && position >= 0 && position < 3) {
        positionedCats[position] = foundCat;
      }
    });
    
    return positionedCats;
  };

  const expeditionCats = getExpeditionCats();

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-purple-900/20 to-purple-950/40 relative">
      {hasActiveExpedition && !expeditionsLoading && cats.length > 0 ? (
        /* Active Expedition Summary */
        <div className="flex flex-col items-center justify-center w-full h-full p-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Expedition in Progress
            </h2>
            
            {/* Cat Display */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[0, 1, 2].map((position) => {
                const cat = expeditionCats[position];
                return (
                  <CatSpriteBox
                    key={position}
                    cat={cat}
                    size="medium"
                    variant="purple"
                    showName
                    badge={
                      <div className="w-4 h-4 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                        {position + 1}
                      </div>
                    }
                    emptyContent={
                      <div className="w-12 h-12 bg-purple-800/30 rounded border border-purple-500/30 flex items-center justify-center">
                        <span className="text-purple-300 text-xs">?</span>
                      </div>
                    }
                  />
                );
              })}
            </div>

            {/* Expedition Info */}
            <div className="text-center mb-6">
              <p className="text-purple-200 mb-2">
                Spread: {currentExpedition?.expedition?.spreadType 
                  ? currentExpedition.expedition.spreadType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  : 'Three Card'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleContinueExpedition}
                className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleEndExpedition}
                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                End Expedition
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Expedition Setup */
        <>
          {/* Card canvas */}
          <div ref={canvasRef} className="relative w-full h-full overflow-hidden">
            <CardCanvas className="w-full h-full">
              {expeditionFlow.deckPosition && (
                <CardDeck
                  ref={deckRef}
                  cards={expeditionCards}
                  deckX={expeditionFlow.deckPosition.x}
                  deckY={expeditionFlow.deckPosition.y}
                />
              )}
            </CardCanvas>

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
        </>
      )}

      {/* Common overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full">
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
            currentExpedition={currentExpedition}
            cats={cats}
            showResults={expeditionFlow.showResults}
            onClose={handleResultsClose}
          />

          {/* Completed Expeditions Button */}
          {!hasActiveExpedition && lastCompletedExpedition && (
            <button
              onClick={() => onEnterExpedition(lastCompletedExpedition.id)}
              className="absolute top-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors z-10 pointer-events-auto"
            >
              View Last Expedition
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpeditionsPage;