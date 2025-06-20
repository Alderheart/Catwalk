import { create } from 'zustand';
import { authService, SignupData, SigninData } from '../services/authService';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signup: (data: SignupData) => Promise<boolean>;
  signin: (data: SigninData) => Promise<boolean>;
  signout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => void;
}

// Token storage helpers
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const setStoredTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};
const clearStoredTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.signup(data);
      
      if (response.success && response.data) {
        const { user, session } = response.data;
        
        // Store tokens
        setStoredTokens(session.access_token, session.refresh_token);
        
        // Update state
        set({
          user: {
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || data.username,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Signup failed',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
      return false;
    }
  },

  signin: async (data: SigninData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.signin(data);
      
      if (response.success && response.data) {
        const { user, session } = response.data;
        
        // Store tokens
        setStoredTokens(session.access_token, session.refresh_token);
        
        // Update state
        set({
          user: {
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Login failed',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
      return false;
    }
  },

  signout: async () => {
    const token = getStoredToken();
    
    if (token) {
      try {
        await authService.signout(token);
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Signout API call failed:', error);
      }
    }
    
    // Clear stored tokens
    clearStoredTokens();
    
    // Clear state
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  checkAuthStatus: () => {
    const token = getStoredToken();
    
    if (token) {
      // In a real app, you'd verify the token with the server
      // For now, just assume it's valid if it exists
      set({ isAuthenticated: true });
      
      // TODO: Add token validation and refresh logic
    } else {
      set({ isAuthenticated: false, user: null });
    }
  },
}));

// Export token getter for API calls
export const getAuthToken = () => getStoredToken();