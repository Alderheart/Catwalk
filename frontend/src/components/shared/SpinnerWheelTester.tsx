import React, { useState } from 'react';
import SpinnerWheel, { SpinnerSection } from './SpinnerWheel';

const SpinnerWheelTester: React.FC = () => {
  const [result, setResult] = useState<SpinnerSection | null>(null);
  const [resultHistory, setResultHistory] = useState<SpinnerSection[]>([]);
  
  // Initial sections with adjustable probabilities
  const [sections, setSections] = useState<SpinnerSection[]>([
    { id: 'section1', label: 'Win', color: '#22c55e', probability: 25 },
    { id: 'section2', label: 'Lose', color: '#ef4444', probability: 25 },
    { id: 'section3', label: 'Bonus', color: '#f59e0b', probability: 25 },
    { id: 'section4', label: 'Retry', color: '#3b82f6', probability: 25 }
  ]);

  const handleSpinComplete = (spinResult: SpinnerSection) => {
    setResult(spinResult);
    setResultHistory(prev => [spinResult, ...prev.slice(0, 9)]); // Keep last 10 results
    
    // Debug: Log the expected vs actual result
    console.log('Spin completed:', {
      result: spinResult.label,
      resultId: spinResult.id,
      probability: spinResult.probability
    });
  };

  const updateSectionProbability = (sectionId: string, newProbability: number) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, probability: newProbability }
          : section
      )
    );
  };

  const addSection = () => {
    const newId = `section${sections.length + 1}`;
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
    const labels = ['Extra', 'Special', 'Rare', 'Lucky', 'Mystery'];
    
    const newSection: SpinnerSection = {
      id: newId,
      label: labels[sections.length % labels.length],
      color: colors[sections.length % colors.length],
      probability: 20
    };

    setSections(prev => [...prev, newSection]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length > 2) { // Keep minimum 2 sections
      setSections(prev => prev.filter(section => section.id !== sectionId));
    }
  };

  const resetProbabilities = () => {
    const equalProbability = 100 / sections.length;
    setSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        probability: Math.round(equalProbability)
      }))
    );
  };

  const clearHistory = () => {
    setResultHistory([]);
    setResult(null);
  };

  const totalProbability = sections.reduce((sum, section) => sum + (section.probability || 0), 0);

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Spinner Wheel Tester</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spinner Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Spinner</h2>
            
            {/* Probability Warning */}
            {totalProbability !== 100 && (
              <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
                <p className="text-yellow-300 text-sm text-center">
                  ⚠️ Total probability: {totalProbability}% (should be 100%)
                </p>
              </div>
            )}
            
            {/* Highest Probability Section */}
            {totalProbability === 100 && (
              <div className="mb-4 p-3 bg-blue-900/50 border border-blue-600 rounded-lg">
                <p className="text-blue-300 text-sm text-center">
                  🎯 Highest chance: {sections.reduce((max, section) => 
                    (section.probability || 0) > (max.probability || 0) ? section : max
                  ).label} ({Math.max(...sections.map(s => s.probability || 0))}%)
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
              <SpinnerWheel
                sections={sections}
                size={280}
                onSpinComplete={handleSpinComplete}
              />
            </div>

            {/* Result Display */}
            {result && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center">
                <h3 className="text-lg font-bold text-white mb-2">Last Result:</h3>
                <div 
                  className="inline-block px-4 py-2 rounded-lg text-white font-bold"
                  style={{ backgroundColor: result.color }}
                >
                  {result.label}
                </div>
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Section Controls */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Section Controls</h3>
                <div className="flex gap-2">
                  <button
                    onClick={addSection}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    + Add
                  </button>
                  <button
                    onClick={resetProbabilities}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Reset %
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: section.color }}
                        />
                        <span className="text-white font-medium">{section.label}</span>
                      </div>
                      {sections.length > 2 && (
                        <button
                          onClick={() => removeSection(section.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 text-sm w-16">
                        {section.probability || 0}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={section.probability || 0}
                        onChange={(e) => updateSectionProbability(section.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-slider"
                        style={{
                          background: `linear-gradient(to right, ${section.color} 0%, ${section.color} ${section.probability || 0}%, #4b5563 ${section.probability || 0}%, #4b5563 100%)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Results History */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Results History</h3>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
              
              {resultHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No spins yet</p>
              ) : (
                <div className="space-y-2">
                  {resultHistory.map((historyResult, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                      <span className="text-gray-300 text-sm">#{resultHistory.length - index}</span>
                      <div 
                        className="px-3 py-1 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: historyResult.color }}
                      >
                        {historyResult.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Statistics */}
              {resultHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h4 className="text-white font-medium mb-2">Statistics:</h4>
                  <div className="space-y-1">
                    {sections.map(section => {
                      const count = resultHistory.filter(r => r.id === section.id).length;
                      const percentage = resultHistory.length > 0 ? ((count / resultHistory.length) * 100).toFixed(1) : '0';
                      return (
                        <div key={section.id} className="flex justify-between text-sm">
                          <span className="text-gray-300">{section.label}:</span>
                          <span className="text-white">{count} ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinnerWheelTester;