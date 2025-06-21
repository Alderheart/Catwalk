import React, { useRef, useState } from 'react';
import CardCanvas from '../animations/CardCanvas';
import CardDeck, { CardDeckHandle } from '../animations/CardDeck';
import { CardData } from '../animations/Card';
import { useCatsStore } from '../../stores/catsStore';
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
  
  const { cats } = useCatsStore();
  const { setActiveTab } = useTabBarStore();

  // Create expedition cards deck
  const expeditionCards: CardData[] = Array.from({ length: 12 }, (_, i) => ({
    id: `expedition-card-${i}`,
    value: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'][i],
    suit: ['♠', '♥', '♦', '♣'][i % 4],
    faceUp: false // Start face down like a real deck
  }));

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

        {/* Expedition Setup Menu */}
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
          showSpreadMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
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
            
            {/* Horizontal spread options */}
            <div className={`flex items-center justify-center gap-3 mb-3 ${!allCatsSelected ? 'opacity-50 pointer-events-none' : ''}`}>
              
              {/* Three Card Spread */}
              <button
                onClick={() => allCatsSelected && setSelectedSpread('three-card')}
                disabled={!allCatsSelected}
                className={`px-4 py-2 rounded-lg border transition-all text-xs ${
                  !allCatsSelected
                    ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : selectedSpread === 'three-card'
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-gray-500 hover:border-gray-400 bg-gray-600/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🔮</span>
                  <div>
                    <div className="font-medium">Three Card</div>
                    <div className="text-gray-300">Past/Present/Future</div>
                  </div>
                </div>
              </button>

              {/* Five Card Spread */}
              <button
                onClick={() => allCatsSelected && setSelectedSpread('horseshoe')}
                disabled={!allCatsSelected}
                className={`px-4 py-2 rounded-lg border transition-all text-xs ${
                  !allCatsSelected
                    ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : selectedSpread === 'horseshoe'
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-gray-500 hover:border-gray-400 bg-gray-600/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🐴</span>
                  <div>
                    <div className="font-medium">Horseshoe</div>
                    <div className="text-gray-300">Five card arc</div>
                  </div>
                </div>
              </button>

              {/* Four Card Spread */}
              <button
                onClick={() => allCatsSelected && setSelectedSpread('four-directions')}
                disabled={!allCatsSelected}
                className={`px-4 py-2 rounded-lg border transition-all text-xs ${
                  !allCatsSelected
                    ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : selectedSpread === 'four-directions'
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-gray-500 hover:border-gray-400 bg-gray-600/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🧭</span>
                  <div>
                    <div className="font-medium">Four Directions</div>
                    <div className="text-gray-300">N/S/E/W</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Start Button */}
            {selectedSpread && (
              <div className="text-center">
                <button
                  onClick={() => {/* TODO: Handle spread start */}}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Begin Expedition
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