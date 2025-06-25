import { Router, Request, Response } from 'express';
import { ApiResponse, AuthenticatedRequest, UserResources } from '../types';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { getUserEnergyStatus, parseInsufficientEnergyError } from '../lib/energyUtils';

const router = Router();

// Sign up new user
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, password, and username are required'
        }
      });
      return;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
      }
    });
    
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SIGNUP_ERROR',
          message: error.message
        }
      });
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to sign up'
      }
    });
  }
});

// Sign in existing user
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password are required'
        }
      });
      return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SIGNIN_ERROR',
          message: error.message
        }
      });
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to sign in'
      }
    });
  }
});

// Sign out user
router.post('/signout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.admin.signOut(token);
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Successfully signed out'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to sign out'
      }
    });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Refresh token is required'
        }
      });
      return;
    }
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });
    
    if (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: error.message
        }
      });
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        session: data.session
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to refresh token'
      }
    });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Fetch user profile with resources using JOIN
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        *,
        user_resources!inner (*)
      `)
      .eq('id', req.userId!)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!userData) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found'
        }
      });
      return;
    }

    // Clean response structure
    const { user_resources, ...user } = userData;
    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...user,
        ...user_resources[0]
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch user profile'
      }
    });
  }
});

// Update user coins
router.patch('/profile/coins', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { coins } = req.body;
    
    if (typeof coins !== 'number' || coins < 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Coins must be a non-negative number'
        }
      });
      return;
    }
    
    const { data: userResources, error } = await supabase
      .from('user_resources')
      .update({ coins })
      .eq('user_id', req.userId!)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const response: ApiResponse<UserResources> = {
      success: true,
      data: userResources
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating user coins:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update user coins'
      }
    });
  }
});

// Get user energy status (with auto-regeneration)
router.get('/profile/energy', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Use the centralized getUserEnergyStatus function to avoid code duplication
    const energyStatus = await getUserEnergyStatus(req.userId!);
    
    if (!energyStatus) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found'
        }
      });
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        daily_energy: energyStatus.daily_energy,
        max_daily_energy: energyStatus.max_daily_energy,
        energy_regen_rate_minutes: energyStatus.energy_regen_rate_minutes,
        minutes_until_next_energy: energyStatus.minutes_until_next_energy,
        is_at_max: energyStatus.is_at_max
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user energy:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch user energy'
      }
    });
  }
});

// Consume energy for an action (uses atomic operation to prevent race conditions)
router.post('/profile/energy/consume', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount = 1 } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Energy amount must be a positive number'
        }
      });
      return;
    }
    
    // Use atomic energy consumption function to prevent race conditions
    const now = new Date();
    const { data, error } = await supabase.rpc('consume_energy_atomic', {
      p_user_id: req.userId!,
      p_amount: amount,
      p_current_time: now.toISOString()
    });
    
    if (error) {
      // Check if it's an insufficient energy error
      if (error.message?.includes('Insufficient energy')) {
        const currentEnergy = parseInsufficientEnergyError(error.message);
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_ENERGY',
            message: error.message
          },
          data: currentEnergy !== undefined ? {
            current_energy: currentEnergy,
            required_energy: amount
          } : undefined
        });
        return;
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found'
        }
      });
      return;
    }
    
    const result = data[0];
    const response: ApiResponse = {
      success: true,
      data: {
        daily_energy: result.new_energy,
        max_daily_energy: result.max_energy,
        energy_consumed: amount,
        message: `Consumed ${amount} energy`
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error consuming user energy:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to consume user energy'
      }
    });
  }
});

// Update energy system settings (for upgrades)
router.patch('/profile/energy/settings', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { max_daily_energy, energy_regen_rate_minutes } = req.body;
    
    const updates: any = {};
    
    if (max_daily_energy !== undefined) {
      if (typeof max_daily_energy !== 'number' || max_daily_energy < 1) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Max daily energy must be a positive number'
          }
        });
        return;
      }
      updates.max_daily_energy = max_daily_energy;
    }
    
    if (energy_regen_rate_minutes !== undefined) {
      if (typeof energy_regen_rate_minutes !== 'number' || energy_regen_rate_minutes < 1) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Energy regen rate must be a positive number'
          }
        });
        return;
      }
      updates.energy_regen_rate_minutes = energy_regen_rate_minutes;
    }
    
    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'No valid updates provided'
        }
      });
      return;
    }
    
    const { data: userResources, error } = await supabase
      .from('user_resources')
      .update(updates)
      .eq('user_id', req.userId!)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const response: ApiResponse<UserResources> = {
      success: true,
      data: userResources
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating energy settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update energy settings'
      }
    });
  }
});

export default router;