import React, { useState, useEffect } from 'react';
import type { Cat } from '../types/Cat';
import CatModal from './CatModal';
import { useCatsStore } from '../stores/catsStore';
import { useTabBarStore } from '../stores/tabBarStore';
import { getCatSpriteUrl } from '../utils/catSprites';

const CatsList: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const { cats, isLoading, error, fetchCats, clearError } = useCatsStore();
  const { setActiveTab } = useTabBarStore();

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCatClick = (cat: Cat) => {
    setSelectedCat(cat);
  };

  const handleCloseModal = () => {
    setSelectedCat(null);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950 safe-area-all flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your cats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950 safe-area-all flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">All Cats</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-4">
            <p>{error}</p>
            <button 
              onClick={clearError}
              className="mt-2 text-red-300 hover:text-red-100 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {cats.length === 0 ? (
          <div className="text-center text-white py-12">
            <div className="text-6xl mb-4">🐱</div>
            <h3 className="text-xl font-semibold mb-2">No cats yet!</h3>
            <p className="text-gray-300 mb-6">
              You haven't adopted any cats yet. Visit the Admin Panel to create your first cat!
            </p>
            <button 
              onClick={() => setActiveTab('admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go to Admin Panel
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cats.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCatClick(cat)}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-pointer"
            >
              {/* Cat sprite */}
              <div className="flex-shrink-0">
                <img
                  src={getCatSpriteUrl(cat)}
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
                  <p>Level: {cat.level} / {cat.max_level}</p>
                  <p>Age: {cat.moons} moons</p>
                  <p>Gender: {cat.gender}</p>
                  <p>Skill: {cat.skill}</p>
                  <p>Trait: {cat.trait}</p>
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
        )}
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