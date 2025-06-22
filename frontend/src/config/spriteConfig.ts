/**
 * Configuration settings for cat sprites and visual rendering
 */
export const spriteConfig = {
  /** Default sprite dimensions */
  sizes: {
    /** Default cat sprite size in pixels */
    default: 90,
    /** Small sprite size for reduced UI */
    small: 45,
    /** Medium sprite size */
    medium: 67,
    /** Large sprite size for emphasis */
    large: 112,
    /** Extra large for special displays */
    xlarge: 179,
  },

  // Sprite rendering settings
  rendering: {
    /** CSS image rendering mode for pixel art */
    imageRendering: 'pixelated' as const,
    /** Object fit mode for sprites */
    objectFit: 'object-contain' as const,
    useDropShadow: true, 				// Whether sprites have a drop shadow
  },

  // Sprite asset paths
  paths: {
    cats: '/assets/sprites/cats/',		// Base directory for cat sprites
    extension: '.png',					// File extension for sprite assets
  },

  /** Animation and transition settings */
  animations: {
    /** Default transition duration for hover effects */
    hoverTransition: 'transition-all',
    /** Scale factor for hover effect */
    hoverScale: 'hover:scale-110',
    /** Transition duration for opacity changes */
    opacityTransition: 'transition-opacity',
  },

  /** Tooltip configuration */
  tooltip: {
    /** Background styling for name tooltips */
    background: 'bg-black/80',
    /** Text color for tooltips */
    textColor: 'text-white',
    /** Text size for tooltips */
    textSize: 'text-xs',
    /** Padding for tooltip content */
    padding: 'px-2 py-1',
    /** Border radius for tooltips */
    borderRadius: 'rounded',
    /** Positioning offset from sprite (mb-1, mb-2, mb-3, etc.) */
    offset: 'mb-0',
  },
} as const;

/**
 * Helper function to get full sprite URL
 * @param filename - Sprite filename without extension
 * @returns Full URL path to sprite
 */
export const getSpriteUrl = (filename: string): string => {
  return `${spriteConfig.paths.cats}${filename}${spriteConfig.paths.extension}`;
};

/**
 * Helper function to get size class for Tailwind
 * @param size - Size in pixels
 * @returns Tailwind class string for width and height
 */
export const getSizeClass = (size: number): string => {
  const sizeMap: Record<number, string> = {
    45: 'w-11 h-11',
    67: 'w-17 h-17',
    90: 'w-23 h-23',
    112: 'w-28 h-28',
    179: 'w-45 h-45',
  };
  
  return sizeMap[size] || `w-[${size}px] h-[${size}px]`;
};