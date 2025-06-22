import { Request } from 'express';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  sessionId?: string;
  user?: SupabaseUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Cat {
  id: string;
  name: string;
  gender: 'male' | 'female';
  moons: number;
  skill: string;
  trait: string;
  breed?: string;
  level: number;
  experience: number;
  max_level: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
}

// Expedition types
export interface Expedition {
  id: string;
  userId: string;
  status: 'active' | 'cards_drawn' | 'completed';
  spreadType: 'three-card' | 'horseshoe' | 'four-directions';
  createdAt: Date;
  completedAt: Date | null;
}

export interface ExpeditionCat {
  id: string;
  expeditionId: string;
  catId: string;
  position: number;
  createdAt: Date;
}

// Major Arcana tarot cards (22 cards)
export type TarotCardName = 
  | 'The Fool' | 'The Magician' | 'The High Priestess' | 'The Empress' | 'The Emperor'
  | 'The Hierophant' | 'The Lovers' | 'The Chariot' | 'Strength' | 'The Hermit'
  | 'Wheel of Fortune' | 'Justice' | 'The Hanged Man' | 'Death' | 'Temperance'
  | 'The Devil' | 'The Tower' | 'The Star' | 'The Moon' | 'The Sun'
  | 'Judgement' | 'The World';

export interface ExpeditionCard {
  id: string;
  expeditionId: string;
  cardPosition: number;
  tarotCardName: TarotCardName;
  orientation: 'upright' | 'reversed';
  createdAt: Date;
}

export interface ExpeditionMinigame {
  id: string;
  expeditionId: string;
  cardPosition: number;
  tarotCardName: TarotCardName;
  orientation: 'upright' | 'reversed';
  minigameType: string | null;
  status: 'pending' | 'completed';
  score: number | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface ExpeditionRewards {
  coins?: number;
  experience?: { [catId: string]: number };
  newCats?: NewCatReward[];
}

export interface NewCatReward {
  name: string;
  gender: 'male' | 'female';
  moons: number;
  skill: string;
  trait: string;
  breed?: string;
}

export interface ExpeditionResult {
  id: string;
  expeditionId: string;
  rewards: ExpeditionRewards;
  narrative: string;
  createdAt: Date;
}

export interface CreateExpeditionRequest {
  spreadType: 'three-card' | 'horseshoe' | 'four-directions';
  catIds: string[]; // Must be exactly 3 cats
}

export interface CompleteExpeditionResponse {
  expedition: Expedition;
  cards: ExpeditionCard[];
  minigames: ExpeditionMinigame[];
  results: ExpeditionResult | null;
  cats: ExpeditionCat[];
}

