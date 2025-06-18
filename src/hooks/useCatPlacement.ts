import { useMemo } from 'react';
import type { Cat } from '../types/Cat';

/**
 * Extended cat interface that includes positioning and visual properties
 * for rendering cats in the camp environment.
 */
export interface CatWithPosition extends Cat {
  /** Horizontal position as percentage (0-100) */
  x: number;
  /** Vertical position as percentage (0-100) */
  y: number;
  /** Scale multiplier for sprite size (default: 1) */
  scale?: number;
  /** Rotation angle in degrees (default: 0) */
  rotation?: number;
  /** Whether sprite should be horizontally flipped (default: false) */
  mirrored?: boolean;
}

/**
 * Configuration options for cat placement algorithm
 */
export interface CatPlacementOptions {
  /** Minimum X boundary as percentage (default: 10) */
  minX?: number;
  /** Maximum X boundary as percentage (default: 90) */
  maxX?: number;
  /** Minimum Y boundary as percentage (default: 10) */
  minY?: number;
  /** Maximum Y boundary as percentage (default: 90) */
  maxY?: number;
  /** Whether to prevent cats from overlapping (default: false) */
  avoidOverlap?: boolean;
  /** Minimum distance between cats in percentage units (default: 15) */
  minDistance?: number;
  /** Sprite size in pixels for boundary calculations (default: 128) */
  spriteSize?: number;
  /** Container width in pixels for boundary calculations (default: 1000) */
  containerWidth?: number;
  /** Container height in pixels for boundary calculations (default: 600) */
  containerHeight?: number;
}

/**
 * Hook that generates positioned cats with visual properties for camp display.
 * Handles random placement, overlap prevention, and sprite boundary calculations.
 * 
 * @param cats - Array of cats to position
 * @param options - Placement configuration options
 * @returns Array of cats with positioning and visual properties
 */
export const useCatPlacement = (
  cats: Cat[], 
  options: CatPlacementOptions = {}
) => {
  const {
    minX = 10,
    maxX = 90,
    minY = 10,
    maxY = 90,
    avoidOverlap = false,
    minDistance = 15,
    spriteSize = 128,
    containerWidth = 1000,
    containerHeight = 600
  } = options;

  // Calculate sprite half-width/height as percentage to prevent edge clipping
  const spritePadding = (spriteSize / 2) / containerWidth * 100;
  const spritePaddingY = (spriteSize / 2) / containerHeight * 100;
  
  // Adjust placement boundaries to keep sprites fully within container
  const adjustedMinX = Math.max(minX, spritePadding);
  const adjustedMaxX = Math.min(maxX, 100 - spritePadding);
  const adjustedMinY = Math.max(minY, spritePaddingY);
  const adjustedMaxY = Math.min(maxY, 100 - spritePaddingY);

  const catsWithPositions = useMemo(() => {
    const placedCats: CatWithPosition[] = [];

    // Place each cat with position and visual properties
    for (const cat of cats) {
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = 50;

      // Generate random position, retrying if overlap prevention is enabled
      do {
        x = Math.random() * (adjustedMaxX - adjustedMinX) + adjustedMinX;
        y = Math.random() * (adjustedMaxY - adjustedMinY) + adjustedMinY;
        attempts++;
      } while (
        avoidOverlap && 
        attempts < maxAttempts && 
        placedCats.some(placedCat => {
          // Calculate Euclidean distance between cats
          const distance = Math.sqrt(
            Math.pow(placedCat.x - x, 2) + Math.pow(placedCat.y - y, 2)
          );
          return distance < minDistance;
        })
      );

      // Add positioned cat with default visual properties
      placedCats.push({
        ...cat,
        x,
        y,
        scale: 1,
        rotation: 0,
        mirrored: Math.random() < 0.5 // Random horizontal flip for visual variety
      });
    }

    return placedCats;
  }, [cats, adjustedMinX, adjustedMaxX, adjustedMinY, adjustedMaxY, avoidOverlap, minDistance]);

  return catsWithPositions;
};