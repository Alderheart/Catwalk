import React from 'react';
import CatSprite from './CatSprite';
import type { CatWithPosition } from '../hooks/useCatPlacement';

/**
 * Props for the CampCat component
 */
interface CampCatProps {
  /** Cat data including position and visual properties */
  cat: CatWithPosition;
  /** Callback function when cat is clicked */
  onCatClick: (cat: CatWithPosition) => void;
  /** Size of the cat sprite in pixels (default: 128) */
  spriteSize?: number;
}

/**
 * Renders an individual cat in the camp with positioning, interactions, and visual effects.
 * Handles click events, tooltips, hover effects, and applies transforms like mirroring and scaling.
 * 
 * @param cat - Cat with positioning and visual properties
 * @param onCatClick - Function called when cat is clicked
 * @param spriteSize - Pixel size for the cat sprite
 */
const CampCat: React.FC<CampCatProps> = ({ 
  cat, 
  onCatClick, 
  spriteSize = 128 
}) => {
  const handleClick = () => {
    onCatClick(cat);
  };

  // Calculate final container size including cat's scale factor
  const containerSize = spriteSize * (cat.scale || 1);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
      style={{
        left: `${cat.x}%`,
        top: `${cat.y}%`,
        // Apply transforms: position centering, rotation, mirroring, and scaling
        transform: `translate(-50%, -50%) rotate(${cat.rotation || 0}deg) scale(${cat.mirrored ? -1 : 1}, ${cat.scale || 1})`
      }}
    >
      <div className="group cursor-pointer" onClick={handleClick}>
        {/* Cat sprite container with dynamic sizing */}
        <div 
          className="drop-shadow-lg"
          style={{
            width: `${containerSize}px`,
            height: `${containerSize}px`
          }}
        >
          <CatSprite 
            spriteUrl={cat.spriteUrl} 
            size={spriteSize} 
            alt={cat.name} 
          />
        </div>
        
        {/* Hover tooltip showing cat name */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {cat.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampCat;