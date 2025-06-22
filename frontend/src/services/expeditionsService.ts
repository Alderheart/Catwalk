import { getAuthToken } from '../stores/authStore';
import { API_BASE_URL } from '../config/api';

// Expedition types (matching backend)
export interface Expedition {
  id: string;
  userId: string;
  status: 'active' | 'cards_drawn' | 'completed';
  spreadType: 'three-card' | 'horseshoe' | 'four-directions';
  createdAt: string;
  completedAt: string | null;
}

export interface ExpeditionCat {
  id: string;
  expeditionId: string;
  catId: string;
  position: number;
  createdAt: string;
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
  createdAt: string;
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

export interface ExpeditionMinigame {
  id: string;
  expeditionId: string;
  cardPosition: number;
  tarotCardName: TarotCardName;
  orientation: 'upright' | 'reversed';
  minigameType: string | null;
  status: 'pending' | 'completed';
  score: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ExpeditionResult {
  id: string;
  expeditionId: string;
  rewards: ExpeditionRewards;
  narrative: string;
  createdAt: string;
}

export interface CompleteExpeditionData {
  expedition: Expedition;
  cards: ExpeditionCard[];
  minigames: ExpeditionMinigame[];
  results: ExpeditionResult | null;
  cats: ExpeditionCat[];
}

// Request/Response interfaces
export interface CreateExpeditionRequest {
  spreadType: 'three-card' | 'horseshoe' | 'four-directions';
  catIds: string[]; // Must be exactly 3 cats
}

export interface ExpeditionsResponse {
  success: boolean;
  data?: Expedition[];
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ExpeditionResponse {
  success: boolean;
  data?: CompleteExpeditionData;
  error?: {
    code: string;
    message: string;
  };
}

export interface DrawCardsRequest {
  cardCount?: number; // Optional - defaults to spread type count
}

export interface DrawCardsResponse {
  success: boolean;
  data?: {
    cards: ExpeditionCard[];
  };
  error?: {
    code: string;
    message: string;
  };
}

class ExpeditionsService {
  private getAuthHeaders() {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getExpeditions(): Promise<ExpeditionsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/expeditions`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }

  async getExpedition(expeditionId: string): Promise<ExpeditionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/expeditions/${expeditionId}`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }

  async createExpedition(data: CreateExpeditionRequest): Promise<ExpeditionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/expeditions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }

  async drawCards(expeditionId: string, data?: DrawCardsRequest): Promise<DrawCardsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/expeditions/${expeditionId}/draw-cards`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data || {}),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }

  async completeExpedition(expeditionId: string): Promise<ExpeditionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/expeditions/${expeditionId}/complete`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }
}

export const expeditionsService = new ExpeditionsService();