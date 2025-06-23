/**
 * CatSpriteBox Component
 * 
 * A reusable UI component for displaying cat sprites in a standardized box format.
 * Used throughout the application for cat selection, expedition displays, and other cat UI elements.
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Basic Cat Display:
 *    <CatSpriteBox cat={myCat} size="medium" />
 * 
 * 2. Empty State with Custom Content:
 *    <CatSpriteBox 
 *      cat={null} 
 *      emptyContent={<div>Select a cat</div>}
 *    />
 * 
 * 3. Interactive Selection with Remove Button:
 *    <CatSpriteBox 
 *      cat={selectedCat}
 *      onClick={() => handleCatSelect()}
 *      actionButton={
 *        <button onClick={(e) => { e.stopPropagation(); removeCat(); }}>×</button>
 *      }
 *    />
 * 
 * 4. Expedition Display with Position Badge:
 *    <CatSpriteBox 
 *      cat={expeditionCat}
 *      variant="purple"
 *      showName
 *      badge={<div className="badge">1</div>}
 *    />
 * 
 * CURRENT IMPLEMENTATIONS:
 * - CatSelector: Cat selection slots with remove buttons
 * - ExpeditionsPage: Active expedition cat display with position badges
 * - Camp: Dropdown expedition status indicator
 * 
 * STYLING VARIANTS:
 * - 'default': Blue theme for selected, gray dashed for empty
 * - 'selected': Always blue highlighted appearance
 * - 'dashed': Always gray dashed appearance  
 * - 'purple': Purple theme for expedition-related displays
 * 
 * SIZE OPTIONS:
 * - 'small': 16x16 box, 8x8 sprite (compact displays)
 * - 'medium': 20x20 box, 10x10 sprite (standard use)
 * - 'large': 24x24 box, 12x12 sprite (prominent displays)
 * 
 * IMPORTANT NOTES:
 * - Always handle onClick events properly with stopPropagation() for nested buttons
 * - Use consistent sprite rendering with built-in spriteConfig
 * - Badge and actionButton are positioned absolutely in corners
 * - Component handles both cat and null states automatically
 * - Custom emptyContent overrides default empty state display
 */

import React from 'react';
import type { Cat } from '../../types/Cat';
import { getCatSpriteUrl } from '../../utils/catSprites';
import { spriteConfig } from '../../config/spriteConfig';

export interface CatSpriteBoxProps {
  /** The cat to display, null for empty state */
  cat: Cat | null;
  /** Size variant for different use cases */
  size?: 'small' | 'medium' | 'large';
  /** Click handler for the box */
  onClick?: () => void;
  /** Optional badge content (top-left corner) */
  badge?: React.ReactNode;
  /** Optional action button content (top-right corner) */
  actionButton?: React.ReactNode;
  /** Show cat name below the box */
  showName?: boolean;
  /** Custom empty state content */
  emptyContent?: React.ReactNode;
  /** Custom CSS classes */
  className?: string;
  /** Border style variant */
  variant?: 'default' | 'selected' | 'dashed' | 'purple';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Reusable cat sprite display box component
 * Used for cat selection, expedition displays, and other cat UI elements
 */
const CatSpriteBox: React.FC<CatSpriteBoxProps> = ({
  cat,
  size = 'medium',
  onClick,
  badge,
  actionButton,
  showName = false,
  emptyContent,
  className = '',
  variant = 'default',
  disabled = false
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      box: 'w-16 h-16',
      sprite: 'w-8 h-8',
      text: 'text-xs'
    },
    medium: {
      box: 'w-20 h-20',
      sprite: 'w-10 h-10',
      text: 'text-sm'
    },
    large: {
      box: 'w-24 h-24',
      sprite: 'w-12 h-12',
      text: 'text-base'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: cat 
      ? 'bg-blue-700/30 border-blue-400 border-solid' 
      : 'bg-gray-700/50 border-gray-500 border-dashed',
    selected: 'bg-blue-600/40 border-blue-300 border-solid',
    dashed: 'bg-gray-700/50 border-gray-500 border-dashed',
    purple: cat
      ? 'bg-purple-900/50 border-purple-600/50 border-solid'
      : 'bg-purple-800/30 border-purple-500/30 border-dashed'
  };

  const config = sizeConfig[size];
  const boxClasses = `
    ${config.box} 
    ${variantConfig[variant]}
    border-2 rounded-lg flex items-center justify-center relative
    ${onClick && !disabled ? 'hover:border-gray-400 transition-colors cursor-pointer' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={boxClasses} onClick={handleClick}>
        {cat ? (
          <>
            {/* Cat sprite */}
            <img 
              src={getCatSpriteUrl(cat)}
              alt={cat.name}
              className={config.sprite}
              style={{ 
                imageRendering: spriteConfig.rendering.imageRendering,
                objectFit: spriteConfig.rendering.objectFit as React.CSSProperties['objectFit']
              }}
            />
            
            {/* Badge (top-left) */}
            {badge && (
              <div className="absolute -top-1 -left-1">
                {badge}
              </div>
            )}
            
            {/* Action button (top-right) */}
            {actionButton && (
              <div className="absolute -top-1 -right-1">
                {actionButton}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Empty state */}
            {emptyContent || (
              <div className={`text-gray-400 ${config.text} text-center`}>
                <div className="text-lg mb-1">🐱</div>
                <div>Empty</div>
              </div>
            )}
            
            {/* Badge for empty state */}
            {badge && (
              <div className="absolute -top-1 -left-1">
                {badge}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Cat name */}
      {showName && cat && (
        <span className={`text-white ${config.text} text-center font-medium mt-1`}>
          {cat.name}
        </span>
      )}
    </div>
  );
};

export default CatSpriteBox;