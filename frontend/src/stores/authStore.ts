import { create } from 'zustand';
import { authService, SignupData, SigninData } from '../services/authService';
import type { User } from '../types/User';

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
  fetchUserProfile: () => Promise<void>;
  updateUserCoins: (coins: number) => Promise<boolean>;
}

// Token storage helpers
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
// const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
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
  isLoading: true,
  error: null,

  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.signup(data);
      
      if (response.success && response.data) {
        const { session } = response.data;
        
        // Store tokens
        setStoredTokens(session.access_token, session.refresh_token);
        
        // Update state temporarily, then fetch full profile
        set({
          user: null, // Will be set by fetchUserProfile
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Fetch full user profile
        get().fetchUserProfile();
        
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
        const { session } = response.data;
        
        // Store tokens
        setStoredTokens(session.access_token, session.refresh_token);
        
        // Update state temporarily, then fetch full profile
        set({
          user: null, // Will be set by fetchUserProfile
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Fetch full user profile
        get().fetchUserProfile();
        
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

  checkAuthStatus: async () => {
    const token = getStoredToken();
    
    if (token) {
      // Validate token by fetching user profile
      try {
        const response = await authService.getUserProfile();
        
        if (response.success && response.data) {
          set({ 
            isAuthenticated: true, 
            user: response.data, 
            isLoading: false 
          });
        } else {
          // Token is invalid, clear it
          console.warn('Invalid token detected:', response.error?.message);
          clearStoredTokens();
          set({ 
            isAuthenticated: false, 
            user: null, 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On network error, assume token is still valid but mark as not loading
        set({ 
          isAuthenticated: true, 
          isLoading: false 
        });
      }
    } else {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  fetchUserProfile: async () => {
    try {
      const response = await authService.getUserProfile();
      
      if (response.success && response.data) {
        set({ user: response.data });
      } else {
        console.error('Failed to fetch user profile:', response.error?.message);
        // Note: 401 responses are handled automatically by handleApiResponse utility
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  },

  updateUserCoins: async (coins: number) => {
    try {
      const response = await authService.updateUserCoins(coins);
      
      if (response.success && response.data) {
        set({ user: response.data });
        return true;
      } else {
        set({ error: response.error?.message || 'Failed to update coins' });
        // Note: 401 responses are handled automatically by handleApiResponse utility
        return false;
      }
    } catch (error) {
      set({ error: 'An unexpected error occurred' });
      return false;
    }
  },
}));

// Export token getter for API calls
export const getAuthToken = () => getStoredToken();