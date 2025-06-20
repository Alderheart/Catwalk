import React, { useState } from 'react';
import { mockCats } from '../data/mockCats';
import type { Cat } from '../types/Cat';
import CatModal from './CatModal';

const CatsList: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  const handleCatClick = (cat: Cat) => {
    setSelectedCat(cat);
  };

  const handleCloseModal = () => {
    setSelectedCat(null);
  };

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950 safe-area-all flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">All Cats</h2>
        
        <div className="space-y-3">
          {mockCats.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCatClick(cat)}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-pointer"
            >
              {/* Cat sprite */}
              <div className="flex-shrink-0">
                <img
                  src={cat.spriteUrl}
                  alt={cat.name}
                  className="w-20 h-20 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              
              {/* Cat info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">
                  {cat.name}
                </h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Age: {cat.age} moons</p>
                  <p>Breed: {cat.breed}</p>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="flex-shrink-0">
                <svg 
                  className="w-5 h-5 text-gray-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Cat modal */}
      <CatModal 
        cat={selectedCat} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default CatsList;