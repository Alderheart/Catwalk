import React, { useMemo, useState } from 'react';
import { mockCats } from '../data/mockCats';
import type { Cat } from '../types/Cat';
import CatModal from './CatModal';


const Camp: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  
  const catsWithPositions = useMemo(() => {
    return mockCats.map(cat => ({
      ...cat,
      x: Math.random() * 80 + 10, // 10-90% to avoid edges
      y: Math.random() * 80 + 10
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Camp</h1>
        <div className="relative bg-green-700/30 backdrop-blur-sm rounded-lg h-[600px] overflow-hidden">
          {/* Ground texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/20" />
          
          {/* Cats positioned randomly */}
          {catsWithPositions.map((cat) => (
            <div
              key={cat.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
              style={{
                left: `${cat.x}%`,
                top: `${cat.y}%`
              }}
            >
              <div className="group cursor-pointer" onClick={() => setSelectedCat(cat)}>
                {/* Cat sprite placeholder */}
                <div className="w-16 h-16 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full relative overflow-hidden shadow-lg">
                  {/* Simple cat face */}
                  <div className="absolute top-3 left-3 w-2 h-2 bg-green-400 rounded-full" />
                  <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full" />
                </div>
                
                {/* Cat name tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {cat.name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <CatModal cat={selectedCat} onClose={() => setSelectedCat(null)} />
    </div>
  );
};

export default Camp;