import { TarotCardName } from '../types/expedition';

export interface TarotCardRewards {
  coins: number;
  expBase: number;
  newCatChance: number;
}

export interface ExpeditionRewardsConfig {
  [cardName: string]: TarotCardRewards;
}

export const DEFAULT_EXPEDITION_REWARDS: ExpeditionRewardsConfig = {
  'The Fool': { coins: 30, expBase: 15, newCatChance: 0.05 },
  'The Magician': { coins: 80, expBase: 40, newCatChance: 0.10 },
  'The High Priestess': { coins: 60, expBase: 35, newCatChance: 0.08 },
  'The Empress': { coins: 90, expBase: 45, newCatChance: 0.12 },
  'The Emperor': { coins: 85, expBase: 42, newCatChance: 0.10 },
  'The Hierophant': { coins: 70, expBase: 35, newCatChance: 0.08 },
  'The Lovers': { coins: 65, expBase: 30, newCatChance: 0.15 },
  'The Chariot': { coins: 75, expBase: 40, newCatChance: 0.06 },
  'Strength': { coins: 80, expBase: 50, newCatChance: 0.05 },
  'The Hermit': { coins: 50, expBase: 35, newCatChance: 0.03 },
  'Wheel of Fortune': { coins: 100, expBase: 30, newCatChance: 0.20 },
  'Justice': { coins: 70, expBase: 40, newCatChance: 0.08 },
  'The Hanged Man': { coins: 40, expBase: 45, newCatChance: 0.05 },
  'Death': { coins: 60, expBase: 50, newCatChance: 0.10 },
  'Temperance': { coins: 65, expBase: 35, newCatChance: 0.07 },
  'The Devil': { coins: 90, expBase: 25, newCatChance: 0.12 },
  'The Tower': { coins: 85, expBase: 20, newCatChance: 0.08 },
  'The Star': { coins: 75, expBase: 40, newCatChance: 0.10 },
  'The Moon': { coins: 55, expBase: 30, newCatChance: 0.06 },
  'The Sun': { coins: 95, expBase: 50, newCatChance: 0.15 },
  'Judgement': { coins: 80, expBase: 45, newCatChance: 0.10 },
  'The World': { coins: 100, expBase: 60, newCatChance: 0.18 }
};

let currentRewardsConfig: ExpeditionRewardsConfig = { ...DEFAULT_EXPEDITION_REWARDS };

export function getExpeditionRewardsConfig(): ExpeditionRewardsConfig {
  return currentRewardsConfig;
}

export function setExpeditionRewardsConfig(config: ExpeditionRewardsConfig): void {
  currentRewardsConfig = { ...config };
}

export function updateCardRewards(cardName: TarotCardName, rewards: Partial<TarotCardRewards>): void {
  if (currentRewardsConfig[cardName]) {
    currentRewardsConfig[cardName] = {
      ...currentRewardsConfig[cardName],
      ...rewards
    };
  }
}

export function getCardRewards(cardName: TarotCardName): TarotCardRewards | null {
  return currentRewardsConfig[cardName] || null;
}

export function resetExpeditionRewardsConfig(): void {
  currentRewardsConfig = JSON.parse(JSON.stringify(DEFAULT_EXPEDITION_REWARDS));
}