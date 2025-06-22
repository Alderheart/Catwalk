import React from 'react';
import { useExpeditionsStore } from '../../stores/expeditionsStore';
import { useCatsStore } from '../../stores/catsStore';
import { useTabBarStore } from '../../stores/tabBarStore';
import { getCatSpriteUrl } from '../../utils/catSprites';
import { spriteConfig } from '../../config/spriteConfig';

/**
 * Persistent expedition info component that shows active expedition details
 * Appears as a floating modal-like section detached from the header
 * Persists across different pages when expedition is active
 */
const PersistentCards: React.FC = () => {
  const { currentExpedition, completeExpedition, clearCurrentExpedition } = useExpeditionsStore();
  const { cats } = useCatsStore();
  const { setActiveTab, activeTab } = useTabBarStore();
  
  // Only show if we have an active expedition and not on expeditions page
  // Show for cards_drawn status, or for recently completed expeditions with results
  const shouldShow = currentExpedition && 
                    currentExpedition.expedition && 
                    (currentExpedition.expedition.status === 'cards_drawn' || 
                     (currentExpedition.expedition.status === 'completed' && currentExpedition.results)) &&
                    activeTab !== 'expeditions';

  if (!shouldShow) {
    return null;
  }

  // Get expedition cats - use currentExpedition.cats for cat IDs
  const expeditionCats = currentExpedition.cats
    ? cats.filter(cat => currentExpedition.cats.some(expCat => expCat.catId === cat.id))
    : [];

  // Calculate progress - after completion cards are cleaned up, so use spread config
  const getSpreadCardCount = (spreadType: string) => {
    switch (spreadType) {
      case 'three-card': return 3;
      case 'horseshoe': return 5;
      case 'four-directions': return 4;
      default: return 3;
    }
  };

  const totalCards = currentExpedition.cards?.length || getSpreadCardCount(currentExpedition.expedition.spreadType);
  const completedCards = currentExpedition.expedition.status === 'completed' ? totalCards : 0;

  const handleGoToExpedition = () => {
    setActiveTab('expeditions');
  };

  const handleEndExpedition = async () => {
    if (currentExpedition.expedition.status === 'completed') {
      // If already completed, just clear it
      clearCurrentExpedition();
    } else {
      // If not completed, complete it first
      await completeExpedition(currentExpedition.expedition.id);
    }
  };

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/90 backdrop-blur-md rounded-lg border border-gray-600 shadow-2xl p-3 min-w-max">
        <div className="flex items-center gap-4">
          {/* Expedition Info */}
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-xs font-semibold">Active Expedition</h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-300">
              <span>Progress: {completedCards}/{totalCards}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${
                currentExpedition.expedition.status === 'completed' ? 'bg-green-400' : 'bg-blue-400 animate-pulse'
              }`}></div>
              <span>
                {currentExpedition.expedition.status === 'completed' ? 'Complete' : 'Active'}
              </span>
            </div>
          </div>

          {/* Expedition Cats */}
          <div className="flex items-center gap-1">
            <span className="text-white text-[10px] mr-1">Cats:</span>
            {expeditionCats.slice(0, 3).map((cat, index) => (
              <div key={cat.id} className="relative">
                <img 
                  src={getCatSpriteUrl(cat)}
                  alt={cat.name}
                  className="w-6 h-6 rounded-full border border-gray-500"
                  style={{ 
                    imageRendering: spriteConfig.rendering.imageRendering,
                    objectFit: spriteConfig.rendering.objectFit as React.CSSProperties['objectFit']
                  }}
                  title={cat.name}
                />
              </div>
            ))}
            {expeditionCats.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center">
                <span className="text-white text-[8px]">+{expeditionCats.length - 3}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToExpedition}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-medium transition-colors"
            >
              View
            </button>
            <button
              onClick={handleEndExpedition}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[10px] font-medium transition-colors"
            >
              {currentExpedition.expedition.status === 'completed' ? 'Dismiss' : 'End'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentCards;