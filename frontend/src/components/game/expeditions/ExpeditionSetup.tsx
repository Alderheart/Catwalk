import React from 'react';
import type { Cat } from '../../../types/Cat';
import CatSelector from './CatSelector';

interface ExpeditionSetupProps {
  selectedCats: (Cat | null)[];
  selectedSpread: string | null;
  showSpreadMenu: boolean;
  showCatSelector: number | null;
  currentExpedition: any;
  drawnCards: any[];
  isCreatingExpedition: boolean;
  expeditionsLoading: boolean;
  cats: Cat[];
  onCatSlotClick: (index: number) => void;
  onCatSelect: (cat: Cat, slotIndex: number) => void;
  onRemoveCat: (index: number) => void;
  onCancelCatSelection: () => void;
  onSpreadSelect: (spread: string) => void;
  onBeginExpedition: () => void;
}

/**
 * Expedition setup interface including cat selection and spread selection
 */
const ExpeditionSetup: React.FC<ExpeditionSetupProps> = ({
  selectedCats,
  selectedSpread,
  showSpreadMenu,
  showCatSelector,
  currentExpedition,
  drawnCards,
  isCreatingExpedition,
  expeditionsLoading,
  cats,
  onCatSlotClick,
  onCatSelect,
  onRemoveCat,
  onCancelCatSelection,
  onSpreadSelect,
  onBeginExpedition
}) => {
  // Check if all cats are selected
  const allCatsSelected = selectedCats.every(cat => cat !== null);

  return (
    <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
      showSpreadMenu && !currentExpedition && drawnCards.length === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
        {/* Cat Selection */}
        <CatSelector
          selectedCats={selectedCats}
          showCatSelector={showCatSelector}
          cats={cats}
          onCatSlotClick={onCatSlotClick}
          onCatSelect={onCatSelect}
          onRemoveCat={onRemoveCat}
          onCancelSelection={onCancelCatSelection}
        />

        {/* Spread Selection */}
        <h3 className={`text-sm font-semibold mb-2 text-center ${allCatsSelected ? 'text-white' : 'text-gray-500'}`}>
          Choose Your Spread
        </h3>
        
        {/* Three Card Spread - Only option for now */}
        <div className={`flex items-center justify-center gap-3 mb-3 ${!allCatsSelected ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => allCatsSelected && onSpreadSelect('three-card')}
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
              onClick={onBeginExpedition}
              disabled={isCreatingExpedition || expeditionsLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              {isCreatingExpedition ? 'Creating...' : 'Begin Expedition'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpeditionSetup;