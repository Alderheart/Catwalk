import type { Cat } from '../types/Cat';
import { getAuthToken } from '../stores/authStore';
import { API_BASE_URL } from '../config/api';

export interface CatsResponse {
  success: boolean;
  data?: Cat[];
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

export interface CatResponse {
  success: boolean;
  data?: Cat;
  error?: {
    code: string;
    message: string;
  };
}

export interface CreateCatData {
  name: string;
  gender: 'male' | 'female';
  moons: number;
  skill: string;
  trait: string;
  breed?: string;
}

export interface UpdateCatData {
  name?: string;
  gender?: 'male' | 'female';
  moons?: number;
  skill?: string;
  trait?: string;
  breed?: string;
}

class CatsService {
  private getAuthHeaders() {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getCats(): Promise<CatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cats`, {
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

  async getCat(catId: string): Promise<CatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cats/${catId}`, {
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

  async createCat(data: CreateCatData): Promise<CatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cats`, {
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

  async updateCat(catId: string, data: UpdateCatData): Promise<CatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cats/${catId}`, {
        method: 'PATCH',
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

  async deleteCat(catId: string): Promise<{ success: boolean; error?: { code: string; message: string } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/cats/${catId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 204) {
        return { success: true };
      }

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

export const catsService = new CatsService();