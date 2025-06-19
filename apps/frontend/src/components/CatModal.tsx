import React from 'react';
import type { Cat } from '../types/Cat';

interface CatModalProps {
  cat: Cat | null;
  onClose: () => void;
}

const CatModal: React.FC<CatModalProps> = ({ cat, onClose }) => {
  if (!cat) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{cat.name}</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-semibold">Age:</span> {cat.age} moons
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Breed:</span> {cat.breed}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CatModal;