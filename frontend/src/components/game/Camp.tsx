import React, { useState, useEffect } from 'react';
import type { Cat } from '../../types/Cat';
import CatModal from './CatModal';
import CampCat from './CampCat';
import { useCatPlacement } from '../../hooks/useCatPlacement';
import type { CatWithPosition } from '../../hooks/useCatPlacement';
import { campConfig } from '../../config/campConfig';
import { spriteConfig } from '../../config/spriteConfig';
import { useCatsStore } from '../../stores/catsStore';
import { useTabBarStore } from '../../stores/tabBarStore';


const Camp: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [spriteSize, setSpriteSize] = useState<number>(spriteConfig.sizes.small);
  const { cats, isLoading, fetchCats } = useCatsStore();
  const { setActiveTab } = useTabBarStore();
  
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

  const handleExpeditionsClick = () => {
    if (cats.length >= 3) {
      setActiveTab('expeditions');
    }
  };

  const canUseExpeditions = cats.length >= 3;

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
            
            {/* Expeditions Button - positioned at top center like a camp entrance */}
            <button
              onClick={handleExpeditionsClick}
              disabled={!canUseExpeditions}
              className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg border-2 transition-all duration-200 flex items-center gap-2 z-20 ${
                canUseExpeditions
                  ? 'bg-green-700 hover:bg-green-600 text-white border-green-500 hover:scale-105 cursor-pointer'
                  : 'bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed opacity-60'
              }`}
              title={canUseExpeditions ? 'Begin an expedition' : `Need at least 3 cats to go on expeditions (${cats.length}/3)`}
            >
              {canUseExpeditions ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              <span className="font-medium">
                {canUseExpeditions ? 'Expeditions' : `Expeditions (${cats.length}/3)`}
              </span>
            </button>
            
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