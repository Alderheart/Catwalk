import { TarotCardName } from '../types';

/**
 * Tarot Card Registry Documentation
 * 
 * 1. **Helper Functions Available**:
 *    - getMinigameType(cardName, orientation): Get minigame type for card
 *    - getCardsWithMinigames(): List all cards with minigames defined
 */

export interface TarotCardDefinition {
  name: TarotCardName;
  number: number;
  uprightMeaning: string;
  reversedMeaning: string;
  uprightMinigame?: string; // Will be set when minigames are implemented
  reversedMinigame?: string; // Will be set when minigames are implemented
}

export const MAJOR_ARCANA_REGISTRY: Record<TarotCardName, TarotCardDefinition> = {
  'The Fool': {
    name: 'The Fool',
    number: 0,
    uprightMeaning: 'New beginnings, innocence, spontaneity, free spirit',
    reversedMeaning: 'Recklessness, taken advantage of, inconsideration'
  },
  'The Magician': {
    name: 'The Magician',
    number: 1,
    uprightMeaning: 'Willpower, desire, creation, manifestation',
    reversedMeaning: 'Trickery, illusions, out of touch'
  },
  'The High Priestess': {
    name: 'The High Priestess',
    number: 2,
    uprightMeaning: 'Intuitive, unconscious, inner voice',
    reversedMeaning: 'Lack of center, lost inner voice, repressed feelings'
  },
  'The Empress': {
    name: 'The Empress',
    number: 3,
    uprightMeaning: 'Motherhood, fertility, nature',
    reversedMeaning: 'Dependence, smothering, emptiness'
  },
  'The Emperor': {
    name: 'The Emperor',
    number: 4,
    uprightMeaning: 'Authority, structure, control, fatherhood',
    reversedMeaning: 'Tyranny, rigidity, coldness'
  },
  'The Hierophant': {
    name: 'The Hierophant',
    number: 5,
    uprightMeaning: 'Tradition, conformity, morality, ethics',
    reversedMeaning: 'Rebellion, subversiveness, new approaches'
  },
  'The Lovers': {
    name: 'The Lovers',
    number: 6,
    uprightMeaning: 'Love, harmony, relationships, values alignment',
    reversedMeaning: 'Disharmony, imbalance, misalignment of values'
  },
  'The Chariot': {
    name: 'The Chariot',
    number: 7,
    uprightMeaning: 'Control, willpower, success, determination',
    reversedMeaning: 'Lack of control, lack of direction, aggression'
  },
  'Strength': {
    name: 'Strength',
    number: 8,
    uprightMeaning: 'Inner strength, bravery, compassion, focus',
    reversedMeaning: 'Self doubt, weakness, insecurity'
  },
  'The Hermit': {
    name: 'The Hermit',
    number: 9,
    uprightMeaning: 'Self-reflection, introspection, inner guidance',
    reversedMeaning: 'Isolation, loneliness, withdrawal',
    uprightMinigame: 'hunting', // The Hermit upright = hunting minigame
  },
  'Wheel of Fortune': {
    name: 'Wheel of Fortune',
    number: 10,
    uprightMeaning: 'Good luck, karma, life cycles, destiny',
    reversedMeaning: 'Bad luck, lack of control, clinging to control'
  },
  'Justice': {
    name: 'Justice',
    number: 11,
    uprightMeaning: 'Justice, fairness, truth, cause and effect',
    reversedMeaning: 'Unfairness, lack of accountability, dishonesty'
  },
  'The Hanged Man': {
    name: 'The Hanged Man',
    number: 12,
    uprightMeaning: 'Suspension, restriction, letting go',
    reversedMeaning: 'Martyrdom, indecision, delay'
  },
  'Death': {
    name: 'Death',
    number: 13,
    uprightMeaning: 'Endings, beginnings, change, transformation',
    reversedMeaning: 'Resistance to change, personal transformation'
  },
  'Temperance': {
    name: 'Temperance',
    number: 14,
    uprightMeaning: 'Balance, moderation, patience, purpose',
    reversedMeaning: 'Imbalance, excess, self-healing, re-alignment'
  },
  'The Devil': {
    name: 'The Devil',
    number: 15,
    uprightMeaning: 'Bondage, addiction, sexuality, materialism',
    reversedMeaning: 'Releasing limiting beliefs, exploring dark thoughts'
  },
  'The Tower': {
    name: 'The Tower',
    number: 16,
    uprightMeaning: 'Sudden change, upheaval, chaos, revelation',
    reversedMeaning: 'Personal transformation, fear of change, averting disaster'
  },
  'The Star': {
    name: 'The Star',
    number: 17,
    uprightMeaning: 'Hope, faith, purpose, renewal, spirituality',
    reversedMeaning: 'Lack of faith, despair, self-trust, disconnection'
  },
  'The Moon': {
    name: 'The Moon',
    number: 18,
    uprightMeaning: 'Illusion, fear, anxiety, subconscious, intuition',
    reversedMeaning: 'Release of fear, repressed emotion, inner confusion'
  },
  'The Sun': {
    name: 'The Sun',
    number: 19,
    uprightMeaning: 'Happiness, success, optimism, vitality',
    reversedMeaning: 'Inner child, feeling down, overly optimistic'
  },
  'Judgement': {
    name: 'Judgement',
    number: 20,
    uprightMeaning: 'Judgement, rebirth, inner calling, absolution',
    reversedMeaning: 'Self-doubt, inner critic, ignoring the call'
  },
  'The World': {
    name: 'The World',
    number: 21,
    uprightMeaning: 'Completion, accomplishment, travel, fulfillment',
    reversedMeaning: 'Seeking personal closure, short-cuts, delays'
  }
};

// Helper function to get minigame type for a card and orientation
export function getMinigameType(cardName: TarotCardName, orientation: 'upright' | 'reversed'): string | null {
  const card = MAJOR_ARCANA_REGISTRY[cardName];
  if (orientation === 'upright') {
    return card.uprightMinigame || null;
  } else {
    return card.reversedMinigame || null;
  }
}

// Helper function to get all cards that have minigames defined
export function getCardsWithMinigames(): Array<{ card: TarotCardName; orientation: 'upright' | 'reversed'; minigameType: string }> {
  const result = [];
  
  for (const cardName in MAJOR_ARCANA_REGISTRY) {
    const card = MAJOR_ARCANA_REGISTRY[cardName as TarotCardName];
    
    if (card.uprightMinigame) {
      result.push({
        card: cardName as TarotCardName,
        orientation: 'upright' as const,
        minigameType: card.uprightMinigame
      });
    }
    
    if (card.reversedMinigame) {
      result.push({
        card: cardName as TarotCardName,
        orientation: 'reversed' as const,
        minigameType: card.reversedMinigame
      });
    }
  }
  
  return result;
}