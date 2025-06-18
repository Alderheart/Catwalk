import React from 'react';

/**
 * Props for the CatSprite component
 */
interface CatSpriteProps {
  /** URL path to the cat sprite image */
  spriteUrl: string;
  /** Size of the sprite in pixels (default: 64) */
  size?: number;
  /** Alt text for accessibility (default: "Cat sprite") */
  alt?: string;
}

/**
 * Renders a cat sprite image with pixel-perfect scaling for retro game aesthetics.
 * Optimized for displaying PNG sprite assets with crisp pixel art rendering.
 * 
 * @param spriteUrl - Path to the sprite image file
 * @param size - Pixel dimensions for width and height
 * @param alt - Accessibility description for screen readers
 */
const CatSpriteComponent: React.FC<CatSpriteProps> = ({ 
  spriteUrl, 
  size = 64, 
  alt = "Cat sprite" 
}) => {
  return (
    <img 
      src={spriteUrl}
      alt={alt}
      width={size}
      height={size}
      style={{ 
        // Ensure pixel art renders with crisp edges instead of blurring
        imageRendering: 'pixelated'
      }}
      className="object-contain"
    />
  );
};

export default CatSpriteComponent;