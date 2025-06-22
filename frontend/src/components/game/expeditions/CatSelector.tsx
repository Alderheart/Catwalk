import React from 'react';
import type { Cat } from '../../../types/Cat';
import { getCatSpriteUrl } from '../../../utils/catSprites';
import { spriteConfig } from '../../../config/spriteConfig';

interface CatSelectorProps {
  selectedCats: (Cat | null)[];
  showCatSelector: number | null;
  cats: Cat[];
  onCatSlotClick: (index: number) => void;
  onCatSelect: (cat: Cat, slotIndex: number) => void;
  onRemoveCat: (index: number) => void;
  onCancelSelection: () => void;
}

/**
 * Cat selection interface with slots and dropdown
 */
const CatSelector: React.FC<CatSelectorProps> = ({
  selectedCats,
  showCatSelector,
  cats,
  onCatSlotClick,
  onCatSelect,
  onRemoveCat,
  onCancelSelection
}) => {
  // Get available cats (not already selected)
  const getAvailableCats = () => {
    const selectedCatIds = selectedCats.filter(cat => cat !== null).map(cat => cat!.id);
    return cats.filter(cat => !selectedCatIds.includes(cat.id));
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-3 text-center">Select 3 Cats for Expedition</h3>
      
      <div className="flex items-center justify-center gap-3">
        {/* Cat Selection Slots */}
        {selectedCats.map((selectedCat, index) => (
          <div
            key={index}
            onClick={() => onCatSlotClick(index)}
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
                    onRemoveCat(index);
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
                    onClick={() => onCatSelect(cat, showCatSelector)}
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
            onClick={onCancelSelection}
            className="mt-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CatSelector;