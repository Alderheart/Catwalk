import React, { useState } from 'react';
import { mockCats } from '../data/mockCats';
import type { Cat } from '../types/Cat';
import CatModal from './CatModal';
import CampCat from './CampCat';
import { useCatPlacement } from '../hooks/useCatPlacement';


const Camp: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  
  // Use the placement hook with options
  const catsWithPositions = useCatPlacement(mockCats, {
    minX: 5,
    maxX: 95,
    minY: 5,
    maxY: 95,
    avoidOverlap: true,
    minDistance: 12,
    spriteSize: 128,
    containerWidth: 1000, // Approximate max-w-6xl width
    containerHeight: 600  // h-[600px] from camp area
  });

  const handleCatClick = (cat: Cat) => {
    setSelectedCat(cat);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Camp</h1>
        <div className="relative bg-green-700/30 backdrop-blur-sm rounded-lg h-[600px] overflow-hidden">
          {/* Ground texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/20" />
          
          {/* Cats positioned using the placement system */}
          {catsWithPositions.map((cat) => (
            <CampCat
              key={cat.id}
              cat={cat}
              onCatClick={handleCatClick}
              spriteSize={128}
            />
          ))}
        </div>
      </div>
      
      <CatModal cat={selectedCat} onClose={() => setSelectedCat(null)} />
    </div>
  );
};

export default Camp;