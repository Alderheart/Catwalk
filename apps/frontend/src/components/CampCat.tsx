import React from 'react';
import CatSprite from './CatSprite';
import type { CatWithPosition } from '../hooks/useCatPlacement';
import { spriteConfig } from '../config/spriteConfig';

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
  spriteSize = spriteConfig.sizes.default 
}) => {
  const handleClick = () => {
    onCatClick(cat);
  };

  // Calculate final container size including cat's scale factor
  const containerSize = spriteSize * (cat.scale || 1);

  return (
    <div
      className={`absolute ${spriteConfig.animations.hoverTransition} ${spriteConfig.animations.hoverScale}`}
      style={{
        left: `${cat.x}%`,
        top: `${cat.y}%`,
        // Apply transforms: position centering, rotation, and scaling (but NOT mirroring)
        transform: `translate(-50%, -50%) rotate(${cat.rotation || 0}deg) scale(${cat.scale || 1})`
      }}
    >
      <div className="group cursor-pointer" onClick={handleClick}>
        {/* Cat sprite container with dynamic sizing and mirroring */}
        <div 
          className={`flex items-center justify-center ${spriteConfig.rendering.useDropShadow ? "drop-shadow-lg" : ""}`}
          style={{
            width: `${containerSize}px`,
            height: `${containerSize}px`,
            // Apply mirroring only to the sprite container
            transform: cat.mirrored ? 'scaleX(-1)' : 'none'
          }}
        >
          <CatSprite 
            spriteUrl={cat.spriteUrl} 
            size={spriteSize} 
            alt={cat.name} 
          />
        </div>
        
        {/* Hover tooltip showing cat name (not affected by sprite mirroring) */}
        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 ${spriteConfig.tooltip.offset} opacity-0 group-hover:opacity-100 ${spriteConfig.animations.opacityTransition}`}>
          <div className={`${spriteConfig.tooltip.background} ${spriteConfig.tooltip.textColor} ${spriteConfig.tooltip.textSize} ${spriteConfig.tooltip.padding} ${spriteConfig.tooltip.borderRadius} whitespace-nowrap`}>
            {cat.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampCat;