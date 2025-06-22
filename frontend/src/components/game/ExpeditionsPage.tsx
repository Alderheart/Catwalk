import React, { useRef, useState, useEffect } from 'react';
import CardCanvas from '../animations/CardCanvas';
import CardDeck, { CardDeckHandle } from '../animations/CardDeck';
import { CardData } from '../animations/Card';
import { useCatsStore } from '../../stores/catsStore';
import { useExpeditionsStore } from '../../stores/expeditionsStore';
import type { Cat } from '../../types/Cat';
import { getCatSpriteUrl } from '../../utils/catSprites';
import { spriteConfig } from '../../config/spriteConfig';
import { useTabBarStore } from '../../stores/tabBarStore';

/**
 * Expeditions page with card spread selection
 * Full page experience with no bottom nav bar
 */
const ExpeditionsPage: React.FC = () => {
  const deckRef = useRef<CardDeckHandle>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [hasStreamedIn, setHasStreamedIn] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [showSpreadMenu, setShowSpreadMenu] = useState(false);
  const [deckPosition, setDeckPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedCats, setSelectedCats] = useState<(Cat | null)[]>([null, null, null]);
  const [showCatSelector, setShowCatSelector] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isCreatingExpedition, setIsCreatingExpedition] = useState(false);
  
  const { cats, fetchCats } = useCatsStore();
  const { 
    currentExpedition, 
    createExpedition, 
    completeExpedition, 
    fetchCurrentExpedition,
    clearCurrentExpedition,
    isLoading: expeditionsLoading,
    error: expeditionsError,
    clearError
  } = useExpeditionsStore();
  const { setActiveTab } = useTabBarStore();

  // Create expedition cards deck - will be replaced with actual cards from backend
  const getExpeditionCards = (): CardData[] => {
    if (currentExpedition?.cards && currentExpedition.cards.length > 0) {
      // Show actual drawn cards if expedition is completed
      return currentExpedition.cards.map((card, i) => ({
        id: `expedition-card-${i}`,
        value: card.tarotCardName,
        suit: '', // No suits for tarot cards
        faceUp: true,
        orientation: card.orientation
      }));
    }
    
    // Default deck for setup (showing a few tarot cards)
    return Array.from({ length: 12 }, (_, i) => ({
      id: `expedition-card-${i}`,
      value: ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice'][i],
      suit: '',
      faceUp: false
    }));
  };
  
  const expeditionCards = getExpeditionCards();

  // Get current canvas dimensions
  const getCanvasDimensions = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    // Use default dimensions that match CardCanvas initial state
    return { width: 800, height: 600 };
  };

  // Initialize deck position when page loads
  React.useEffect(() => {
    const dimensions = getCanvasDimensions();
    setDeckPosition({
      x: dimensions.width * 0.5,
      y: dimensions.height + 100
    });
  }, []);

  // Stream cards in from bottom when page loads and deck is positioned
  React.useEffect(() => {
    if (!hasStreamedIn && deckPosition) {
      // Small delay to let page render
      setTimeout(() => {
        const dimensions = getCanvasDimensions();
        const centerX = dimensions.width * 0.5;
        const centerY = dimensions.height * 0.4; // Slightly above center to leave room for spread menu
        
        deckRef.current?.streamTo(centerX, centerY, () => {
          setHasStreamedIn(true);
          // Delay showing the spread menu for smooth transition
          setTimeout(() => {
            setShowSpreadMenu(true);
          }, 500);
        });
      }, 300);
    }
  }, [hasStreamedIn, deckPosition]);

  // Handle cat selection
  const handleCatSlotClick = (slotIndex: number) => {
    setShowCatSelector(slotIndex);
  };

  const handleCatSelect = (cat: Cat, slotIndex: number) => {
    const newSelectedCats = [...selectedCats];
    newSelectedCats[slotIndex] = cat;
    setSelectedCats(newSelectedCats);
    setShowCatSelector(null);
  };

  const handleRemoveCat = (slotIndex: number) => {
    const newSelectedCats = [...selectedCats];
    newSelectedCats[slotIndex] = null;
    setSelectedCats(newSelectedCats);
    setShowCatSelector(null);
  };

  // Get available cats (not already selected)
  const getAvailableCats = () => {
    const selectedCatIds = selectedCats.filter(cat => cat !== null).map(cat => cat!.id);
    return cats.filter(cat => !selectedCatIds.includes(cat.id));
  };

  // Check if all cats are selected
  const allCatsSelected = selectedCats.every(cat => cat !== null);

  // Load data on mount
  useEffect(() => {
    fetchCats();
    fetchCurrentExpedition();
  }, [fetchCats, fetchCurrentExpedition]);
  
  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  // Auto-show results when expedition is completed
  useEffect(() => {
    if (currentExpedition && currentExpedition.expedition && currentExpedition.expedition.status === 'completed' && currentExpedition.results) {
      setShowResults(true);
    }
  }, [currentExpedition]);
  
  // Handle expedition creation
  const handleBeginExpedition = async () => {
    if (!selectedSpread || !allCatsSelected) return;
    
    setIsCreatingExpedition(true);
    
    const catIds = selectedCats.filter(cat => cat !== null).map(cat => cat!.id);
    
    const success = await createExpedition({
      spreadType: selectedSpread as 'three-card' | 'horseshoe' | 'four-directions',
      catIds
    });
    
    if (success) {
      // Reset UI to show the created expedition
      setSelectedCats([null, null, null]);
      setSelectedSpread(null);
      setShowSpreadMenu(false);
      setHasStreamedIn(false);
    }
    
    setIsCreatingExpedition(false);
  };
  
  // Handle expedition completion
  const handleCompleteExpedition = async () => {
    if (!currentExpedition || !currentExpedition.expedition || currentExpedition.expedition.status !== 'active') return;
    
    const result = await completeExpedition(currentExpedition.expedition.id);
    
    if (result) {
      setShowResults(true);
      // Refresh cats data to get updated experience/new cats
      fetchCats(true);
    }
  };
  
  // Handle starting a new expedition
  const handleNewExpedition = () => {
    clearCurrentExpedition();
    setShowResults(false);
    setSelectedCats([null, null, null]);
    setSelectedSpread(null);
    setShowSpreadMenu(false);
    setHasStreamedIn(false);
    
    // Restart the card animation
    const dimensions = getCanvasDimensions();
    setDeckPosition({
      x: dimensions.width * 0.5,
      y: dimensions.height + 100
    });
  };
  
  // Handle back navigation
  const handleBack = () => {
    setActiveTab('camp');
  };

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

      {/* Card canvas with full screen usage */}
      <div 
        ref={canvasRef}
        className="relative w-full h-full"
      >
        <CardCanvas className="w-full h-full">
          {deckPosition && (
            <CardDeck
              ref={deckRef}
              cards={expeditionCards}
              deckX={deckPosition.x}
              deckY={deckPosition.y}
            />
          )}
        </CardCanvas>

        {/* Loading State */}
        {expeditionsLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white text-center">
              <p className="text-lg">Loading expedition...</p>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {expeditionsError && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-red-900/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm max-w-sm">
              <div className="flex items-center justify-between">
                <span>{expeditionsError}</span>
                <button onClick={clearError} className="ml-2 text-red-300 hover:text-white">×</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Active Expedition Status */}
        {currentExpedition && currentExpedition.expedition && currentExpedition.cats && currentExpedition.expedition.status === 'active' && !showResults && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white text-center max-w-md">
              <h2 className="text-lg font-bold mb-3">Expedition In Progress</h2>
              <p className="text-gray-300 mb-4">Your cats are ready for their {currentExpedition.expedition.spreadType?.replace('-', ' ') || 'tarot'} expedition.</p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                {currentExpedition.cats && currentExpedition.cats.map((expeditionCat) => {
                  const cat = cats.find(c => c.id === expeditionCat.catId);
                  return cat ? (
                    <div key={cat.id} className="text-center">
                      <img 
                        src={getCatSpriteUrl(cat)}
                        alt={cat.name}
                        className="w-12 h-12 mx-auto mb-1"
                        style={{ 
                          imageRendering: spriteConfig.rendering.imageRendering,
                          objectFit: spriteConfig.rendering.objectFit as React.CSSProperties['objectFit']
                        }}
                      />
                      <div className="text-xs">{cat.name}</div>
                    </div>
                  ) : null;
                })}
              </div>
              
              <button
                onClick={handleCompleteExpedition}
                disabled={expeditionsLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {expeditionsLoading ? 'Drawing Cards...' : 'Draw Cards & Complete'}
              </button>
            </div>
          </div>
        )}
        
        {/* Expedition Results */}
        {currentExpedition && currentExpedition.expedition && currentExpedition.cards && currentExpedition.results && currentExpedition.expedition.status === 'completed' && showResults && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full mx-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 text-center">Expedition Complete!</h2>
              
              {/* Cards Display */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Cards Drawn:</h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {currentExpedition.cards && currentExpedition.cards.map((card, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-16 h-24 border-2 rounded-lg flex flex-col items-center justify-center text-xs ${
                        card.orientation === 'upright' ? 'border-green-400 bg-green-900/30' : 'border-red-400 bg-red-900/30'
                      }`}>
                        <div className="font-bold text-center px-1">{card.tarotCardName}</div>
                        <div className="text-xs mt-1">{card.orientation}</div>
                      </div>
                      <div className="text-xs mt-1 text-gray-400">
                        {index === 0 ? 'Past' : index === 1 ? 'Present' : 'Future'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Narrative */}
              <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-200">{currentExpedition.results?.narrative || 'Your expedition has concluded.'}</p>
              </div>
              
              {/* Rewards */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Rewards:</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {currentExpedition.results?.rewards?.coins && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">🪙</span>
                      <span>{currentExpedition.results.rewards.coins} coins</span>
                    </div>
                  )}
                  {currentExpedition.results?.rewards?.experience && Object.keys(currentExpedition.results.rewards.experience).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400">⭐</span>
                        <span>Experience gained:</span>
                      </div>
                      {Object.entries(currentExpedition.results.rewards.experience).map(([catId, exp]) => {
                        const cat = cats.find(c => c.id === catId);
                        return cat ? (
                          <div key={catId} className="ml-6 text-xs text-gray-300">
                            {cat.name}: +{exp} XP
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  {currentExpedition.results?.rewards?.newCats && currentExpedition.results.rewards.newCats.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400">🐱</span>
                        <span>New cats joined:</span>
                      </div>
                      {currentExpedition.results.rewards.newCats.map((newCat, index) => (
                        <div key={index} className="ml-6 text-xs text-gray-300">
                          {newCat.name} ({newCat.gender}, {newCat.moons} moons, {newCat.skill})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleNewExpedition}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  New Expedition
                </button>
                <button
                  onClick={handleBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Back to Camp
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Expedition Setup Menu */}
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
          showSpreadMenu && !currentExpedition ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
            {/* Cat Selection */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-center">Select 3 Cats for Expedition</h3>
              
              <div className="flex items-center justify-center gap-3">
                {/* Cat Selection Slots */}
                {selectedCats.map((selectedCat, index) => (
                  <div
                    key={index}
                    onClick={() => handleCatSlotClick(index)}
                    className={`relative w-20 h-20 border-2 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer ${
                      selectedCat 
                        ? 'bg-blue-700/30 border-blue-400 border-solid' 
                        : 'bg-gray-700/50 border-gray-500 border-dashed'
                    }`}
                  >
                    {selectedCat ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                          src={getCatSpriteUrl(selectedCat)}
                          alt={selectedCat.name}
                          className="w-16 h-16"
                          style={{ 
                            imageRendering: spriteConfig.rendering.imageRendering,
                            objectFit: spriteConfig.rendering.objectFit as React.CSSProperties['objectFit']
                          }}
                        />
                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveCat(index);
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs text-center">
                        <div className="text-lg mb-1">🐱</div>
                        <div>Cat {index + 1}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Cat Selector Dropdown */}
              {showCatSelector !== null && (
                <div className="mt-3 p-3 bg-gray-800/70 rounded-lg border border-gray-600">
                  <div className="text-xs text-gray-300 mb-2">
                    Select a cat for slot {showCatSelector + 1}:
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar">
                    {getAvailableCats().length > 0 ? (
                      <div className="space-y-1">
                        {getAvailableCats().map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCatSelect(cat, showCatSelector)}
                            className="w-full text-left px-2 py-1 rounded hover:bg-gray-700 transition-colors text-xs text-white flex items-center gap-2"
                          >
                            <img 
                              src={getCatSpriteUrl(cat)}
                              alt={cat.name}
                              className="w-8 h-8 flex-shrink-0"
                              style={{ 
                                imageRendering: spriteConfig.rendering.imageRendering,
                                objectFit: spriteConfig.rendering.objectFit as React.CSSProperties['objectFit']
                              }}
                            />
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-gray-400">({cat.moons} moons, {cat.skill})</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">
                        All cats are already selected
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCatSelector(null)}
                    className="mt-2 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Spread Selection */}
            <h3 className={`text-sm font-semibold mb-2 text-center ${allCatsSelected ? 'text-white' : 'text-gray-500'}`}>
              Choose Your Spread
            </h3>
            
            {/* Three Card Spread - Only option for now */}
            <div className={`flex items-center justify-center gap-3 mb-3 ${!allCatsSelected ? 'opacity-50 pointer-events-none' : ''}`}>
              <button
                onClick={() => allCatsSelected && setSelectedSpread('three-card')}
                disabled={!allCatsSelected}
                className={`px-6 py-3 rounded-lg border transition-all text-sm ${
                  !allCatsSelected
                    ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : selectedSpread === 'three-card'
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-gray-500 hover:border-gray-400 bg-gray-600/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔮</span>
                  <div>
                    <div className="font-medium">Three Card Spread</div>
                    <div className="text-gray-300 text-xs">Past • Present • Future</div>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Coming Soon */}
            <div className="text-center text-xs text-gray-500 mb-3">
              More spread types coming soon!
            </div>

            {/* Start Button */}
            {selectedSpread && (
              <div className="text-center">
                <button
                  onClick={handleBeginExpedition}
                  disabled={isCreatingExpedition || expeditionsLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  {isCreatingExpedition ? 'Creating...' : 'Begin Expedition'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionsPage;