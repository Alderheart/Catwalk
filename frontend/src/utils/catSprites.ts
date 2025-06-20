import type { Cat } from '../types/Cat';

// Available sprite files
const SPRITE_FILES = [
  '/assets/sprites/cats/Cat-1-Sitting.png',
  '/assets/sprites/cats/Cat-2-Sitting.png',
  '/assets/sprites/cats/Cat-3-Sitting.png',
  '/assets/sprites/cats/Cat-4-Sitting.png',
  '/assets/sprites/cats/Cat-5-Sitting.png',
  '/assets/sprites/cats/Cat-6-Sitting.png',
];

// Breed to sprite mapping
const BREED_SPRITE_MAP: Record<string, string> = {
  'ginger': SPRITE_FILES[0],     // Cat 1 - Ginger
  'black': SPRITE_FILES[1],      // Cat 2 - Black
  'siamese': SPRITE_FILES[2],    // Cat 3 - Siamese
  'sphynx': SPRITE_FILES[3],     // Cat 4 - Sphynx
  'ragdoll': SPRITE_FILES[4],    // Cat 5 - Ragdoll
  'tabby': SPRITE_FILES[5],      // Cat 6 - Tabby
  // Skill fallbacks if no breed specified
  'hunting': SPRITE_FILES[0], // Default for hunting skill
  'fighting': SPRITE_FILES[1], // Default for fighting skill
  'climbing': SPRITE_FILES[2], // Default for climbing skill
  'swimming': SPRITE_FILES[3], // Default for swimming skill
  'medicine': SPRITE_FILES[4], // Default for medicine skill
  'default': SPRITE_FILES[5], // Fallback
};

/**
 * Get sprite URL for a cat based on its attributes
 * Currently uses breed if available, otherwise falls back to skill
 */
export function getCatSpriteUrl(cat: Cat): string {
  // If breed is specified, use that
  if (cat.breed && BREED_SPRITE_MAP[cat.breed]) {
    return BREED_SPRITE_MAP[cat.breed];
  }
  
  // Fall back to skill-based sprite
  if (cat.skill && BREED_SPRITE_MAP[cat.skill]) {
    return BREED_SPRITE_MAP[cat.skill];
  }
  
  // Ultimate fallback: use cat ID to determine sprite consistently
  const catIdNumber = parseInt(cat.id.replace(/\D/g, '')) || 0;
  const spriteIndex = catIdNumber % SPRITE_FILES.length;
  return SPRITE_FILES[spriteIndex];
}

/**
 * Get all available breeds
 */
export function getAvailableBreeds(): string[] {
  return [
    'ginger',
    'black',
    'siamese',
    'sphynx',
    'ragdoll',
    'tabby',
  ];
}

/**
 * Get all available skills
 */
export function getAvailableSkills(): string[] {
  return [
    'hunting',
    'fighting',
    'climbing',
    'swimming',
    'medicine',
  ];
}

/**
 * Get all available traits
 */
export function getAvailableTraits(): string[] {
  return [
    'loyal',
    'brave',
    'curious',
    'playful',
    'wise',
    'fierce',
    'gentle',
    'energetic',
    'calm',
    'adventurous',
  ];
}