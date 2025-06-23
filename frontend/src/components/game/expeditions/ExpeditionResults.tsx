import React from 'react';
import type { Cat } from '../../../types/Cat';
import { CompleteExpeditionData } from '../../../services/expeditionsService';

interface ExpeditionResultsProps {
  currentExpedition: CompleteExpeditionData | null;
  cats: Cat[];
  showResults: boolean;
  onClose: () => void;
}

/**
 * Displays expedition completion results including cards drawn, narrative, and rewards
 */
const ExpeditionResults: React.FC<ExpeditionResultsProps> = ({
  currentExpedition,
  cats,
  showResults,
  onClose
}) => {
  if (!currentExpedition?.expedition || !currentExpedition?.results || 
      currentExpedition.expedition.status !== 'completed' || !showResults) {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full mx-4">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4 text-center">Expedition Complete!</h2>
        
        {/* Cards Display - Show cards if available (during completion flow) or hide section if cleaned up */}
        {currentExpedition.cards && currentExpedition.cards.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Cards Drawn:</h3>
            <div className="flex items-center justify-center gap-2 mb-3">
              {currentExpedition.cards.map((card, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-24 border-2 rounded-lg flex flex-col items-center justify-center text-xs ${
                    card.orientation === 'upright' ? 'border-green-400 bg-green-900/30' : 'border-red-400 bg-red-900/30'
                  }`}>
                    <div className="font-bold text-center px-1">{card.tarotCardName}</div>
                    <div className="text-xs mt-1">{card.orientation}</div>
                  </div>
                  <div className="text-xs mt-1 text-gray-400">
                    {index === 0 ? 'Past' : index === 1 ? 'Present' : 'Future'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Narrative */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-200">
            {currentExpedition.results?.narrative || 'Your expedition has concluded.'}
          </p>
        </div>
        
        {/* Rewards */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Rewards:</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {currentExpedition.results?.rewards?.coins && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">🪙</span>
                <span>{currentExpedition.results.rewards.coins} coins</span>
              </div>
            )}
            {currentExpedition.results?.rewards?.experience && Object.keys(currentExpedition.results.rewards.experience).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400">⭐</span>
                  <span>Experience gained:</span>
                </div>
                {Object.entries(currentExpedition.results.rewards.experience).map(([catId, exp]) => {
                  const cat = cats.find(c => c.id === catId);
                  return cat ? (
                    <div key={catId} className="ml-6 text-xs text-gray-300">
                      {cat.name}: +{exp} XP
                    </div>
                  ) : null;
                })}
              </div>
            )}
            {currentExpedition.results?.rewards?.newCats && currentExpedition.results.rewards.newCats.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400">🐱</span>
                  <span>New cats joined:</span>
                </div>
                {currentExpedition.results.rewards.newCats.map((newCat, index) => (
                  <div key={index} className="ml-6 text-xs text-gray-300">
                    {newCat.name} ({newCat.gender}, {newCat.moons} moons, {newCat.skill})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionResults;