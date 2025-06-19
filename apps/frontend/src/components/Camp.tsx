import React, { useState } from 'react';
import { mockCats } from '../data/mockCats';
import type { Cat } from '../types/Cat';
import CatPopover from './CatPopover';
import CampCat from './CampCat';
import { useCatPlacement } from '../hooks/useCatPlacement';
import type { CatWithPosition } from '../hooks/useCatPlacement';
import { campConfig } from '../config/campConfig';
import { spriteConfig } from '../config/spriteConfig';


const Camp: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Use the placement hook with config values
  const catsWithPositions = useCatPlacement(mockCats, {
    spriteSize: spriteConfig.sizes.default,
  });

  const handleCatClick = (cat: CatWithPosition) => {
    // If clicking the same cat, close the popover
    if (selectedCat?.id === cat.id) {
      handleClosePopover();
    } else {
      setSelectedCat(cat);
      // Position popover at cat's location
      setPopoverPosition({ x: cat.x, y: cat.y });
    }
  };

  const handleClosePopover = () => {
    setSelectedCat(null);
    setPopoverPosition(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${campConfig.styling.background.from} ${campConfig.styling.background.to} p-8`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Camp</h1>
        <div className={`relative ${campConfig.styling.campArea.background} ${campConfig.styling.campArea.backdropBlur} ${campConfig.styling.campArea.borderRadius} overflow-visible`}
             style={{ height: `${campConfig.dimensions.height}px` }}>
          {/* Ground texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/20 rounded-lg" />
          
          {/* Cats positioned using the placement system */}
          {catsWithPositions.map((cat) => (
            <CampCat
              key={cat.id}
              cat={cat}
              onCatClick={handleCatClick}
              spriteSize={spriteConfig.sizes.default}
            />
          ))}
          
          {/* Cat popover positioned relative to camp area */}
          <CatPopover 
            cat={selectedCat} 
            position={popoverPosition}
            onClose={handleClosePopover} 
          />
        </div>
      </div>
    </div>
  );
};

export default Camp;