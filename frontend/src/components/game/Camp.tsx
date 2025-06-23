import React, { useState, useEffect } from 'react';
import type { Cat } from '../../types/Cat';
import CatModal from './CatModal';
import CampCat from './CampCat';
import { useCatPlacement } from '../../hooks/useCatPlacement';
import type { CatWithPosition } from '../../hooks/useCatPlacement';
import { campConfig } from '../../config/campConfig';
import { spriteConfig } from '../../config/spriteConfig';
import { useCatsStore } from '../../stores/catsStore';
import { useExpeditionsStore } from '../../stores/expeditionsStore';
import LoadingDisplay from '../shared/LoadingDisplay';
import CatSpriteBox from '../ui/CatSpriteBox';


const Camp: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [spriteSize, setSpriteSize] = useState<number>(spriteConfig.sizes.small);
  const [isExpeditionDropdownOpen, setIsExpeditionDropdownOpen] = useState<boolean>(false);
  const { cats, isLoading, fetchCats } = useCatsStore();
  const { currentExpedition, fetchCurrentExpedition } = useExpeditionsStore();
  
  // Fetch cats and expedition data when component mounts
  useEffect(() => {
    fetchCats();
    fetchCurrentExpedition();
  }, []);

  // Helper function to check if a cat is currently on an expedition
  const isCatOnExpedition = (catId: string): boolean => {
    // Check if there's a current expedition and this cat is in it
    // Handle both camelCase (catId) and snake_case (cat_id) field names
    return currentExpedition?.cats?.some(expeditionCat => 
      expeditionCat.catId === catId || (expeditionCat as any).cat_id === catId
    ) || false;
  };

  // Filter out cats that are on expeditions
  const availableCats = cats.filter(cat => !isCatOnExpedition(cat.id));

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
  
  // Use the placement hook with config values (only for cats not on expeditions)
  const catsWithPositions = useCatPlacement(availableCats, {
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
    return <LoadingDisplay isLoading={isLoading} variant="camp" />;
  }

  return (
    <div className={`h-full w-full overflow-hidden bg-gradient-to-b ${campConfig.styling.background.from} ${campConfig.styling.background.to} safe-area-all relative`}>
      {/* Ground texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/20" />
      
      {/* Expedition status indicator */}
      {currentExpedition && currentExpedition.cats && currentExpedition.cats.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          {/* Dropdown header - always visible */}
          <button
            onClick={() => setIsExpeditionDropdownOpen(!isExpeditionDropdownOpen)}
            className="bg-orange-900/80 backdrop-blur-sm border border-orange-600 text-orange-200 px-4 py-3 rounded-lg text-sm font-medium hover:bg-orange-800/80 transition-colors flex items-center gap-2"
          >
            <span>Cats on expedition ({currentExpedition.cats.length})</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isExpeditionDropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Dropdown content - shows when expanded */}
          {isExpeditionDropdownOpen && (
            <div className="mt-2 bg-orange-900/90 backdrop-blur-sm border border-orange-600 text-orange-200 px-4 py-3 rounded-lg text-sm">
              <div className="flex gap-2">
                {(() => {
                  // Get the cats on expedition in proper order
                  const expeditionCats = new Array(3).fill(null);
                  currentExpedition.cats.forEach(expCat => {
                    const catId = expCat.catId || (expCat as any).cat_id;
                    const position = expCat.position !== undefined ? expCat.position : (expCat as any).pos;
                    const foundCat = cats.find(cat => cat.id === catId);
                    if (foundCat && position >= 0 && position < 3) {
                      expeditionCats[position] = foundCat;
                    }
                  });
                  
                  return expeditionCats.map((cat, index) => (
                    <CatSpriteBox
                      key={index}
                      cat={cat}
                      size="small"
                      variant="default"
                      className="opacity-90"
                      emptyContent={
                        <div className="text-orange-300 text-xs">?</div>
                      }
                    />
                  ));
                })()} 
              </div>
            </div>
          )}
        </div>
      )}
      
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
  );
};

export default Camp;