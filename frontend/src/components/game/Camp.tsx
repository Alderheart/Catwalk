import React, { useState, useEffect } from 'react';
import type { Cat } from '../../types/Cat';
import CatModal from './CatModal';
import CampCat from './CampCat';
import { useCatPlacement } from '../../hooks/useCatPlacement';
import type { CatWithPosition } from '../../hooks/useCatPlacement';
import { campConfig } from '../../config/campConfig';
import { spriteConfig } from '../../config/spriteConfig';
import { useCatsStore } from '../../stores/catsStore';


const Camp: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [spriteSize, setSpriteSize] = useState<number>(spriteConfig.sizes.small);
  const { cats, isLoading, fetchCats } = useCatsStore();
  
  // Fetch cats when component mounts
  useEffect(() => {
    fetchCats();
  }, []);

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
  const catsWithPositions = useCatPlacement(cats, {
    spriteSize: spriteSize,
  });

  const handleCatClick = (cat: CatWithPosition) => {
    // If clicking the same cat, close the modal
    if (selectedCat?.id === cat.id) {
      handleCloseModal();
    } else {
      setSelectedCat(cat);
    }
  };

  const handleCloseModal = () => {
    setSelectedCat(null);
  };


  if (isLoading) {
    return (
      <div className={`h-full w-full overflow-hidden bg-gradient-to-b ${campConfig.styling.background.from} ${campConfig.styling.background.to} safe-area-all flex items-center justify-center`}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading camp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full overflow-hidden bg-gradient-to-b ${campConfig.styling.background.from} ${campConfig.styling.background.to} safe-area-all flex flex-col`}>
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col p-4 sm:p-6 md:p-8">
        {/* Responsive camp area container */}
        <div className="relative w-full flex-1 max-h-full">
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
            
            {/* Cat modal */}
            <CatModal 
              cat={selectedCat} 
              onClose={handleCloseModal} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camp;