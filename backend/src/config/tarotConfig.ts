import { TarotCardName } from '../types';

export type TarotOrientation = 'upright' | 'reversed';

export interface TarotCardConfig {
  name: TarotCardName;
  allowedOrientations: TarotOrientation[];
  enabled: boolean;
  weight?: number; // Optional weight for card draw probability (default: 1)
}

export interface TarotDeckConfig {
  cards: TarotCardConfig[];
  globalOrientationWeights: {
    upright: number;
    reversed: number;
  };
}

// Tarot deck configuration
export const DEFAULT_TAROT_CONFIG: TarotDeckConfig = {
	// Tarot card toggle
	cards: [
		{ name: 'The Fool', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Magician', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The High Priestess', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Empress', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Emperor', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Hierophant', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Lovers', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Chariot', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'Strength', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Hermit', allowedOrientations: ['upright'], enabled: true, weight: 1 },
		{ name: 'Wheel of Fortune', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'Justice', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Hanged Man', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'Death', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'Temperance', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Devil', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Tower', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Star', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Moon', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The Sun', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'Judgement', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 1 },
		{ name: 'The World', allowedOrientations: ['upright', 'reversed'], enabled: false, weight: 0.5 } // Rare/powerful card
	],
	// Upright / Reversed chances
	globalOrientationWeights: {
		upright: 0.7,
		reversed: 0.3 
	}
};

// Runtime configuration - can be modified
let currentTarotConfig: TarotDeckConfig = { ...DEFAULT_TAROT_CONFIG };

/**
 * Get the current tarot configuration
 */
export function getTarotConfig(): TarotDeckConfig {
  return currentTarotConfig;
}

/**
 * Update the tarot configuration
 */
export function setTarotConfig(config: Partial<TarotDeckConfig>): void {
  currentTarotConfig = {
    ...currentTarotConfig,
    ...config,
    cards: config.cards || currentTarotConfig.cards,
    globalOrientationWeights: config.globalOrientationWeights || currentTarotConfig.globalOrientationWeights
  };
}

/**
 * Update configuration for specific cards
 */
export function updateCardConfig(cardName: TarotCardName, config: Partial<Omit<TarotCardConfig, 'name'>>): void {
  const cardIndex = currentTarotConfig.cards.findIndex(card => card.name === cardName);
  if (cardIndex !== -1) {
    currentTarotConfig.cards[cardIndex] = {
      ...currentTarotConfig.cards[cardIndex],
      ...config
    };
  }
}

/**
 * Enable or disable a specific card
 */
export function setCardEnabled(cardName: TarotCardName, enabled: boolean): void {
  updateCardConfig(cardName, { enabled });
}

/**
 * Set allowed orientations for a specific card
 */
export function setCardOrientations(cardName: TarotCardName, orientations: TarotOrientation[]): void {
  updateCardConfig(cardName, { allowedOrientations: orientations });
}

/**
 * Set global orientation weights
 */
export function setGlobalOrientationWeights(upright: number, reversed: number): void {
  const total = upright + reversed;
  currentTarotConfig.globalOrientationWeights = {
    upright: upright / total,
    reversed: reversed / total
  };
}

/**
 * Get all enabled cards for deck generation
 */
export function getEnabledCards(): TarotCardConfig[] {
  return currentTarotConfig.cards.filter(card => card.enabled);
}

/**
 * Generate a weighted deck based on current configuration
 */
export function generateConfiguredTarotDeck(): TarotCardName[] {
  const enabledCards = getEnabledCards();
  const deck: TarotCardName[] = [];
  
  for (const card of enabledCards) {
    const weight = card.weight || 1;
    // Add the card multiple times based on its weight
    for (let i = 0; i < weight; i++) {
      deck.push(card.name);
    }
  }
  
  return deck;
}

/**
 * Get a random orientation for a card based on its allowed orientations and global weights
 */
export function getRandomOrientation(cardName: TarotCardName): TarotOrientation {
  const cardConfig = currentTarotConfig.cards.find(card => card.name === cardName);
  if (!cardConfig) {
    throw new Error(`Card ${cardName} not found in configuration`);
  }
  
  const allowedOrientations = cardConfig.allowedOrientations;
  
  // If only one orientation is allowed, return it
  if (allowedOrientations.length === 1) {
    return allowedOrientations[0];
  }
  
  // If both orientations are allowed, use global weights
  if (allowedOrientations.includes('upright') && allowedOrientations.includes('reversed')) {
    const { upright } = currentTarotConfig.globalOrientationWeights;
    return Math.random() < upright ? 'upright' : 'reversed';
  }
  
  // This shouldn't happen if configuration is valid, but fallback to random
  return allowedOrientations[Math.floor(Math.random() * allowedOrientations.length)];
}

/**
 * Validate the current configuration
 */
export function validateTarotConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if at least one card is enabled
  const enabledCards = getEnabledCards();
  if (enabledCards.length === 0) {
    errors.push('At least one card must be enabled');
  }
  
  // Check if cards have valid orientations
  for (const card of currentTarotConfig.cards) {
    if (card.enabled && card.allowedOrientations.length === 0) {
      errors.push(`Card "${card.name}" is enabled but has no allowed orientations`);
    }
  }
  
  // Check orientation weights
  const { upright } = currentTarotConfig.globalOrientationWeights;
  if (upright < 0) {
    errors.push('Orientation weights must be non-negative');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Reset configuration to default
 */
export function resetTarotConfig(): void {
  currentTarotConfig = JSON.parse(JSON.stringify(DEFAULT_TAROT_CONFIG));
}