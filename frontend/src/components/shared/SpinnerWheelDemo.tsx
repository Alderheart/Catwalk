import React, { useState } from 'react';
import SpinnerWheel, { SpinnerSection } from './SpinnerWheel';

const SpinnerWheelDemo: React.FC = () => {
  const [result, setResult] = useState<SpinnerSection | null>(null);

  // Example configurations
  const simpleWheel: SpinnerSection[] = [
    { id: '1', label: 'Win', color: '#22c55e' },
    { id: '2', label: 'Lose', color: '#ef4444' },
    { id: '3', label: 'Try Again', color: '#3b82f6' },
    { id: '4', label: 'Bonus', color: '#f59e0b' }
  ];

  const lootWheel: SpinnerSection[] = [
    { id: 'common', label: 'Common', color: '#6b7280', probability: 40 },
    { id: 'uncommon', label: 'Uncommon', color: '#22c55e', probability: 25 },
    { id: 'rare', label: 'Rare', color: '#3b82f6', probability: 15 },
    { id: 'epic', label: 'Epic', color: '#8b5cf6', probability: 10 },
    { id: 'legendary', label: 'Legendary', color: '#f59e0b', probability: 5 },
    { id: 'nothing', label: 'Nothing', color: '#374151', probability: 5 }
  ];

  const expeditionWheel: SpinnerSection[] = [
    { id: 'success', label: 'Success', color: '#10b981' },
    { id: 'partial', label: 'Partial', color: '#f59e0b' },
    { id: 'failure', label: 'Failure', color: '#ef4444' },
    { id: 'event', label: 'Event', color: '#8b5cf6' },
    { id: 'treasure', label: 'Treasure', color: '#eab308' },
    { id: 'danger', label: 'Danger', color: '#dc2626' },
    { id: 'rest', label: 'Rest', color: '#06b6d4' },
    { id: 'explore', label: 'Explore', color: '#059669' }
  ];

  const handleSpinComplete = (spinResult: SpinnerSection) => {
    setResult(spinResult);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Spinner Wheel Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Simple 4-section wheel */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Simple Wheel</h2>
          <SpinnerWheel
            sections={simpleWheel}
            size={250}
            onSpinComplete={handleSpinComplete}
          />
        </div>

        {/* Loot wheel with 6 sections and weighted probabilities */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Weighted Loot Wheel</h2>
          <div className="text-xs text-gray-400 mb-2 text-center">
            Common: 40% | Uncommon: 25% | Rare: 15% | Epic: 10% | Legendary: 5% | Nothing: 5%
          </div>
          <SpinnerWheel
            sections={lootWheel}
            size={250}
            onSpinComplete={handleSpinComplete}
          />
        </div>

        {/* Expedition wheel with 8 sections */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Expedition Wheel</h2>
          <SpinnerWheel
            sections={expeditionWheel}
            size={250}
            onSpinComplete={handleSpinComplete}
          />
        </div>
      </div>

      {/* Result display */}
      {result && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg text-center">
          <h2 className="text-xl font-bold text-white mb-2">Last Result:</h2>
          <div 
            className="inline-block px-4 py-2 rounded-lg text-white font-bold"
            style={{ backgroundColor: result.color }}
          >
            {result.label}
          </div>
        </div>
      )}

      {/* Usage instructions */}
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Usage Example:</h2>
        <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded overflow-x-auto">
{`import SpinnerWheel, { SpinnerSection } from './SpinnerWheel';

// Equal probability sections
const sections: SpinnerSection[] = [
  { id: 'win', label: 'Win', color: '#22c55e' },
  { id: 'lose', label: 'Lose', color: '#ef4444' },
  { id: 'bonus', label: 'Bonus', color: '#f59e0b' }
];

// Weighted probability sections
const weightedSections: SpinnerSection[] = [
  { id: 'common', label: 'Common', color: '#6b7280', probability: 50 },
  { id: 'rare', label: 'Rare', color: '#3b82f6', probability: 30 },
  { id: 'legendary', label: 'Legendary', color: '#f59e0b', probability: 20 }
];

<SpinnerWheel
  sections={sections}
  size={300}
  onSpinComplete={(result) => console.log('Result:', result)}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default SpinnerWheelDemo;