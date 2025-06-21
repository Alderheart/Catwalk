import React, { useEffect, useRef } from 'react';
import type { Cat } from '../types/Cat';
import { spriteConfig } from '../config/spriteConfig';

interface CatPopoverProps {
  cat: Cat | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

const CatPopover: React.FC<CatPopoverProps> = ({ cat, position, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (cat) {
      // Small delay to prevent immediate close on same click
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);
      }, 100);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [cat, onClose]);

  if (!cat || !position) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 animate-in pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, calc(-100% - ${spriteConfig.popover.offsetY}px))`,
        transformOrigin: 'center bottom'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px] pointer-events-auto">
        {/* Arrow pointing down */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
        </div>
        
        {/* Cat info */}
        <h3 className="font-bold text-lg mb-2">{cat.name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            <span className="font-medium">Level:</span> {cat.level}
          </p>
          <p>
            <span className="font-medium">Age:</span> {cat.moons} moons
          </p>
          <p>
            <span className="font-medium">Breed:</span> {cat.breed || 'Unknown'}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
          <button 
            className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            onClick={() => {
              console.log('View details for', cat.name);
              onClose();
            }}
          >
            Details
          </button>
          <button 
            className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              console.log('Interact with', cat.name);
              onClose();
            }}
          >
            Interact
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatPopover;