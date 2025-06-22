import type { User } from '../types/User';
import { API_BASE_URL } from '../config/api';
import { handleApiResponse } from '../utils/apiUtils';

export interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  error?: {
    code: string;
    message: string;
  };
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  async signin(data: SigninData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  async signout(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
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

  async getUserProfile(): Promise<UserResponse> {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'No authentication token found',
          },
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return await handleApiResponse<UserResponse>(response);
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

  async updateUserCoins(coins: number): Promise<UserResponse> {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'No authentication token found',
          },
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/coins`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coins }),
      });

      return await handleApiResponse<UserResponse>(response);
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

export const authService = new AuthService();