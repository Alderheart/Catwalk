/**
 * Configuration settings for camp layout and cat placement
 */
export const campConfig = {
  /** Camp container dimensions */
  dimensions: {
    /** Width of the camp area in pixels */
    width: 1000,
    /** Height of the camp area in pixels */
    height: 600,
  },

  /** Cat placement boundaries as percentages (0-100) */
  placement: {
    /** Default placement boundaries */
    default: {
      minX: 5,
      maxX: 95,
      minY: 5,
      maxY: 95,
    },
    /** Safe boundaries that account for sprite size */
    safe: {
      minX: 10,
      maxX: 90,
      minY: 10,
      maxY: 90,
    },
  },

  /** Cat spacing and overlap settings */
  spacing: {
    /** Whether to prevent cats from overlapping by default */
    avoidOverlap: true,
    /** Minimum distance between cats in percentage units */
    minDistance: 12,
    /** Maximum attempts to find non-overlapping position */
    maxPlacementAttempts: 50,
  },

  /** Visual effects and animations */
  effects: {
    /** Chance for cats to be horizontally mirrored (0-1) */
    mirrorChance: 0.5,
    /** Default scale factor for cats */
    defaultScale: 1,
    /** Default rotation in degrees */
    defaultRotation: 0,
    /** Hover scale effect multiplier */
    hoverScale: 1.1,
  },

  /** Camp visual styling */
  styling: {
    /** Background gradient colors */
    background: {
      from: 'from-green-400',
      to: 'to-green-600',
    },
    /** Camp area styling */
    campArea: {
      background: 'bg-green-700/30',
      backdropBlur: 'backdrop-blur-sm',
      borderRadius: 'rounded-lg',
    },
  },
} as const;