/**
 * Configuration for expedition card display and animations
 */
export const expeditionConfig = {
  cards: {
    // Card dimensions for different states
    center: {
      width: 70,
      height: 100,
    },
    top: {
      width: 70,  // Same size as center for consistency
      height: 100, // Same size as center for consistency
    },
    zoom: {
      width: 70,
      height: 100,
      scale: 8, // Scale multiplier for zoom animation
    },
  },
  
  // Unified spacing configuration for smooth transitions
  spacing: {
    base: 95,           // Base spacing between cards
    responsive: true,   // Enable responsive adjustment based on screen size
    minSpacing: 20,     // Minimum gap between cards regardless of screen
    maxSpacing: 130,    // Maximum spacing on very large screens
    interpolate: true,  // Enable smooth transitions between states
    breakpoint: 800,    // Screen width breakpoint for responsive adjustments
  },
  
  // Animation durations (in milliseconds)
  animation: {
    cardFlip: 800,
    zoomToMinigame: 4000,
    cardMovement: 800,
    spacingTransition: 600,  // Duration for smooth spacing changes
    positionTransition: 800, // Duration for position changes (matches cardMovement)
  },
  
  // Positioning
  positions: {
    topY: 120,        // Y position when cards are at top
    centerY: 0.4,     // Percentage of screen height for center position
    centerOffset: -120, // Y offset from center position
  },
  
  // Debug settings
  debug: {
    logSizing: true,   // Enable debug logging for sizing issues
    logSpacing: true,  // Enable debug logging for spacing
  },
} as const;

export type ExpeditionConfig = typeof expeditionConfig;