import React from 'react';
import { useNotchDetection } from '../hooks/useNotchDetection';

const TopHeader: React.FC = () => {
  const { hasNotch, safeAreaTop } = useNotchDetection();
  
  return (
    <header 
      className="bg-green-800 text-white shadow-lg"
      style={{
        paddingTop: hasNotch ? `${safeAreaTop}px` : '0px'
      }}
    >
      <div className="px-4 py-3 flex items-center justify-center">
        <h1 className="text-xl font-bold">Clangen</h1>
      </div>
    </header>
  );
};

export default TopHeader;