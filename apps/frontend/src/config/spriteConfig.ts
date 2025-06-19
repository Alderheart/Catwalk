/**
 * Configuration settings for cat sprites and visual rendering
 */
export const spriteConfig = {
  /** Default sprite dimensions */
  sizes: {
    /** Default cat sprite size in pixels */
    default: 128,
    /** Small sprite size for reduced UI */
    small: 64,
    /** Medium sprite size */
    medium: 96,
    /** Large sprite size for emphasis */
    large: 160,
    /** Extra large for special displays */
    xlarge: 256,
  },

  /** Sprite rendering settings */
  rendering: {
    /** CSS image rendering mode for pixel art */
    imageRendering: 'pixelated' as const,
    /** Object fit mode for sprites */
    objectFit: 'object-contain' as const,
    /** Whether to use drop shadows by default */
    useDropShadow: true,
  },

  /** Popover settings */
  popover: {
    /** Vertical offset from sprite center in pixels */
    offsetY: 80,
    /** Minimum horizontal margin from edges as percentage */
    minEdgeMargin: 15,
  },

  /** Sprite asset paths */
  paths: {
    /** Base directory for cat sprites */
    cats: '/assets/sprites/cats/',
    /** File extension for sprite assets */
    extension: '.png',
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
    64: 'w-16 h-16',
    96: 'w-24 h-24',
    128: 'w-32 h-32',
    160: 'w-40 h-40',
    256: 'w-64 h-64',
  };
  
  return sizeMap[size] || `w-[${size}px] h-[${size}px]`;
};