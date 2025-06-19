import React, { useState } from 'react';
import { mockCats } from '../data/mockCats';
import type { Cat } from '../types/Cat';
import CatModal from './CatModal';
import CampCat from './CampCat';
import { useCatPlacement } from '../hooks/useCatPlacement';
import { campConfig } from '../config/campConfig';
import { spriteConfig } from '../config/spriteConfig';


const Camp: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  
  // Use the placement hook with config values
  const catsWithPositions = useCatPlacement(mockCats, {
    spriteSize: spriteConfig.sizes.default,
  });

  const handleCatClick = (cat: Cat) => {
    setSelectedCat(cat);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${campConfig.styling.background.from} ${campConfig.styling.background.to} p-8`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Camp</h1>
        <div className={`relative ${campConfig.styling.campArea.background} ${campConfig.styling.campArea.backdropBlur} ${campConfig.styling.campArea.borderRadius} overflow-hidden`}
             style={{ height: `${campConfig.dimensions.height}px` }}>
          {/* Ground texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/20" />
          
          {/* Cats positioned using the placement system */}
          {catsWithPositions.map((cat) => (
            <CampCat
              key={cat.id}
              cat={cat}
              onCatClick={handleCatClick}
              spriteSize={spriteConfig.sizes.default}
            />
          ))}
        </div>
      </div>
      
      <CatModal cat={selectedCat} onClose={() => setSelectedCat(null)} />
    </div>
  );
};

export default Camp;