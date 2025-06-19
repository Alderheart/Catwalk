import React, { useState, useEffect } from 'react';
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
  const [spriteSize, setSpriteSize] = useState(spriteConfig.sizes.small);
  
  // Responsive sprite sizing
  useEffect(() => {
    const updateSpriteSize = () => {
      if (window.innerWidth < 640) {
        setSpriteSize(spriteConfig.sizes.small);
      } else if (window.innerWidth < 1024) {
        setSpriteSize(spriteConfig.sizes.medium);
      } else {
        setSpriteSize(spriteConfig.sizes.default);
      }
    };
    
    updateSpriteSize();
    window.addEventListener('resize', updateSpriteSize);
    return () => window.removeEventListener('resize', updateSpriteSize);
  }, []);
  
  // Use the placement hook with config values
  const catsWithPositions = useCatPlacement(mockCats, {
    spriteSize: spriteSize,
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
    <div className={`min-h-screen w-full overflow-x-hidden bg-gradient-to-b ${campConfig.styling.background.from} ${campConfig.styling.background.to} p-4 sm:p-6 md:p-8`}>
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 md:mb-8">Camp</h1>
        {/* Responsive camp area container */}
        <div className="relative w-full aspect-[5/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[70vh]">
          <div className={`absolute inset-0 ${campConfig.styling.campArea.background} ${campConfig.styling.campArea.backdropBlur} ${campConfig.styling.campArea.borderRadius} overflow-hidden`}>
            {/* Ground texture */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/20 rounded-lg" />
            
            {/* Cats positioned using the placement system */}
            {catsWithPositions.map((cat) => (
              <CampCat
                key={cat.id}
                cat={cat}
                onCatClick={handleCatClick}
                spriteSize={spriteSize}
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
    </div>
  );
};

export default Camp;