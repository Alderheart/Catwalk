import { useMemo, useEffect, useRef } from 'react';
import type { Cat } from '../types/Cat';
import { campConfig } from '../config/campConfig';
import { getCatSpriteUrl } from '../utils/catSprites';
import { useCatPositionsStore } from '../stores/catPositionsStore';

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
  /** URL for the cat's sprite image */
  spriteUrl: string;
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
  const { getPosition, setPosition } = useCatPositionsStore();
  const {
    minX = campConfig.placement.default.minX,
    maxX = campConfig.placement.default.maxX,
    minY = campConfig.placement.default.minY,
    maxY = campConfig.placement.default.maxY,
    avoidOverlap = campConfig.spacing.avoidOverlap,
    minDistance = campConfig.spacing.minDistance,
    spriteSize = 128,
    containerWidth = campConfig.dimensions.width,
    containerHeight = campConfig.dimensions.height
  } = options;

  // Calculate sprite boundaries as percentage to prevent edge clipping
  // Use configurable padding to ensure full visibility
  const spritePadding = (spriteSize * campConfig.spacing.boundaryPadding) / containerWidth * 100;
  const spritePaddingY = (spriteSize * campConfig.spacing.boundaryPadding) / containerHeight * 100;
  
  // Adjust placement boundaries to keep sprites fully within container
  const adjustedMinX = Math.max(minX, spritePadding);
  const adjustedMaxX = Math.min(maxX, 100 - spritePadding);
  const adjustedMinY = Math.max(minY, spritePaddingY);
  const adjustedMaxY = Math.min(maxY, 100 - spritePaddingY);

  const newPositionsRef = useRef<Array<{ id: string; position: any }>>([]);

  const catsWithPositions = useMemo(() => {
    const placedCats: CatWithPosition[] = [];
    newPositionsRef.current = [];

    // Place each cat with position and visual properties
    for (const cat of cats) {
      // Check if we have cached position for this cat
      const cachedPosition = getPosition(cat.id);
      
      if (cachedPosition) {
        // Use cached position
        placedCats.push({
          ...cat,
          ...cachedPosition
        });
      } else {
        // Generate new position for this cat
        let x: number, y: number;
        let attempts = 0;

        // Generate random position, retrying if overlap prevention is enabled
        do {
          x = Math.random() * (adjustedMaxX - adjustedMinX) + adjustedMinX;
          y = Math.random() * (adjustedMaxY - adjustedMinY) + adjustedMinY;
          attempts++;
        } while (
          avoidOverlap && 
          attempts < campConfig.spacing.maxPlacementAttempts && 
          placedCats.some(placedCat => {
            // Calculate Euclidean distance between cats
            const distance = Math.sqrt(
              Math.pow(placedCat.x - x, 2) + Math.pow(placedCat.y - y, 2)
            );
            return distance < minDistance;
          })
        );

        // Create position data
        const scale = campConfig.effects.defaultScale;
        const rotation = campConfig.effects.defaultRotation;
        const mirrored = Math.random() < campConfig.effects.mirrorChance;
        const spriteUrl = getCatSpriteUrl(cat);

        // Store position to set later (outside of render)
        newPositionsRef.current.push({
          id: cat.id,
          position: { x, y, scale, rotation, mirrored, spriteUrl }
        });

        // Add positioned cat with visual properties
        placedCats.push({
          ...cat,
          x,
          y,
          scale,
          rotation,
          mirrored,
          spriteUrl
        });
      }
    }

    return placedCats;
  }, [cats, adjustedMinX, adjustedMaxX, adjustedMinY, adjustedMaxY, avoidOverlap, minDistance, getPosition]);

  // Set new positions in useEffect to avoid side effects during render
  useEffect(() => {
    if (newPositionsRef.current.length > 0) {
      newPositionsRef.current.forEach(({ id, position }) => {
        setPosition(id, position);
      });
      newPositionsRef.current = [];
    }
  }, [catsWithPositions, setPosition]);

  return catsWithPositions;
};