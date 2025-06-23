/**
 * CatsList Component
 * 
 * Full-screen scrollable list of all user cats with:
 * - Real-time API data via catsStore
 * - Loading states and error handling
 * - Empty state with admin panel navigation
 * - Click to open CatModal for details
 * - Custom scrollbar styling (see index.css)
 */

import React, { useState, useEffect } from 'react';
import type { Cat } from '../../types/Cat';
import CatModal from './CatModal';
import { useCatsStore } from '../../stores/catsStore';
import { useTabBarStore } from '../../stores/tabBarStore';
import { useExpeditionsStore } from '../../stores/expeditionsStore';
import { getCatSpriteUrl } from '../../utils/catSprites';
import LoadingDisplay from '../shared/LoadingDisplay';

const CatsList: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const { cats, isLoading, error, fetchCats, clearError } = useCatsStore();
  const { setActiveTab } = useTabBarStore();
  const { currentExpedition, expeditions, fetchCurrentExpedition, fetchExpeditions } = useExpeditionsStore();

  useEffect(() => {
    fetchCats();
    fetchCurrentExpedition();
    fetchExpeditions();
  }, []);

  // Helper function to check if a cat is currently on an expedition
  const isCatOnExpedition = (catId: string): boolean => {
    // Check if there's a current expedition and this cat is in it
    // Handle both camelCase (catId) and snake_case (cat_id) field names
    return currentExpedition?.cats?.some(expeditionCat => 
      expeditionCat.catId === catId || (expeditionCat as any).cat_id === catId
    ) || false;
  };

  const handleCatClick = (cat: Cat) => {
    // Don't open modal if cat is on expedition
    if (isCatOnExpedition(cat.id)) {
      return;
    }
    setSelectedCat(cat);
  };

  const handleCloseModal = () => {
    setSelectedCat(null);
  };

  if (isLoading) {
    return <LoadingDisplay isLoading={isLoading} variant="cats" />;
  }

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950 safe-area-all flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">All Cats</h2>
        
        {/* Debug info for expedition status */}
        {(currentExpedition || expeditions.length > 0) && (
          <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-md mb-4 text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Total expeditions: {expeditions.length}</p>
            <p>Current expedition: {currentExpedition ? 'Yes' : 'No'}</p>
            {currentExpedition && (
              <>
                <p>Cats on expedition: {currentExpedition.cats?.length || 0}</p>
                <p>Cat IDs: {currentExpedition.cats?.map(c => c.catId || (c as any).cat_id || 'undefined').join(', ')}</p>
                <p>Expedition status: {currentExpedition.expedition?.status}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer">Raw expedition cats data</summary>
                  <pre className="text-xs bg-black/20 p-2 mt-1 rounded overflow-auto max-h-32">
                    {JSON.stringify(currentExpedition.cats, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        )}
        
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
            {cats.map((cat) => {
              const isOnExpedition = isCatOnExpedition(cat.id);
              return (
            <div
              key={cat.id}
              onClick={() => handleCatClick(cat)}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 transition-colors ${
                isOnExpedition 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-white/20 cursor-pointer'
              }`}
            >
              {/* Cat sprite */}
              <div className="flex-shrink-0 relative">
                <img
                  src={getCatSpriteUrl(cat)}
                  alt={cat.name}
                  className={`w-14 h-14 object-contain ${
                    isOnExpedition ? 'grayscale' : ''
                  }`}
                  style={{ imageRendering: 'pixelated' }}
                />
                {isOnExpedition && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded text-[10px] font-bold">
                    🗺️
                  </div>
                )}
              </div>
              
              {/* Cat info */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold truncate ${
                  isOnExpedition ? 'text-gray-400' : 'text-white'
                }`}>
                  {cat.name}
                  {isOnExpedition && (
                    <span className="ml-2 text-sm text-orange-400">(On Expedition)</span>
                  )}
                </h3>
                <div className={`text-sm space-y-1 ${
                  isOnExpedition ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  <p>Level: {cat.level} / {cat.max_level}</p>
                  <p>Age: {cat.moons} moons</p>
                  <p>Gender: {cat.gender}</p>
                  <p>Skill: {cat.skill}</p>
                  <p>Trait: {cat.trait}</p>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="flex-shrink-0">
                {isOnExpedition ? (
                  <div className="w-5 h-5 text-gray-600">
                    🚫
                  </div>
                ) : (
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
                )}
              </div>
            </div>
            );
            })}
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