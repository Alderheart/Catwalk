import React, { useEffect } from 'react';
import type { Cat } from '../../types/Cat';
import { getCatSpriteUrl } from '../../utils/catSprites';

interface CatModalProps {
  cat: Cat | null;
  onClose: () => void;
}

const CatModal: React.FC<CatModalProps> = ({ cat, onClose }) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (cat) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [cat, onClose]);

  if (!cat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center safe-area-all">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 p-6 m-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Cat sprite */}
        <div className="flex justify-center mb-4">
          <img
            src={getCatSpriteUrl(cat)}
            alt={cat.name}
            className="w-32 h-32 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        {/* Cat info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">{cat.name}</h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-medium">Level:</span> {cat.level} / {cat.max_level}
            </p>
            <p>
              <span className="font-medium">Experience:</span> {cat.experience} / 100
            </p>
            <p>
              <span className="font-medium">Age:</span> {cat.moons} moons
            </p>
            <p>
              <span className="font-medium">Breed:</span> {cat.breed || 'Unknown'}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button 
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            onClick={() => {
              console.log('View details for', cat.name);
              onClose();
            }}
          >
            View Details
          </button>
          <button 
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => {
              console.log('Interact with', cat.name);
              onClose();
            }}
          >
            Interact
          </button>
          <button 
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatModal;