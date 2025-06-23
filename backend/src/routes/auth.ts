import { Router, Request, Response } from 'express';
import { ApiResponse, AuthenticatedRequest, User } from '../types';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';

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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId!)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found'
        }
      });
      return;
    }
    
    const response: ApiResponse<User> = {
      success: true,
      data: user
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
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ coins })
      .eq('id', req.userId!)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const response: ApiResponse<User> = {
      success: true,
      data: user
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
    const { data: user, error } = await supabase
      .from('users')
      .select('daily_energy, max_daily_energy, energy_regen_rate_minutes, last_energy_update')
      .eq('id', req.userId!)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found'
        }
      });
      return;
    }
    
    // Calculate energy regeneration
    const now = new Date();
    const lastUpdate = new Date(user.last_energy_update);
    const timeDiff = now.getTime() - lastUpdate.getTime();
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));
    
    let newEnergy = user.daily_energy;
    let shouldUpdate = false;
    
    if (minutesPassed >= user.energy_regen_rate_minutes && user.daily_energy < user.max_daily_energy) {
      const energyToAdd = Math.floor(minutesPassed / user.energy_regen_rate_minutes);
      newEnergy = Math.min(user.daily_energy + energyToAdd, user.max_daily_energy);
      shouldUpdate = newEnergy > user.daily_energy;
    }
    
    // Update database if energy changed
    if (shouldUpdate) {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          daily_energy: newEnergy,
          last_energy_update: now.toISOString()
        })
        .eq('id', req.userId!)
        .select('daily_energy, max_daily_energy, energy_regen_rate_minutes, last_energy_update')
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      user.daily_energy = updatedUser.daily_energy;
      user.last_energy_update = updatedUser.last_energy_update;
    }
    
    // Calculate time until next energy regeneration
    const nextRegenMinutes = user.daily_energy >= user.max_daily_energy 
      ? 0 
      : user.energy_regen_rate_minutes - (minutesPassed % user.energy_regen_rate_minutes);
    
    const response: ApiResponse = {
      success: true,
      data: {
        daily_energy: user.daily_energy,
        max_daily_energy: user.max_daily_energy,
        energy_regen_rate_minutes: user.energy_regen_rate_minutes,
        minutes_until_next_energy: nextRegenMinutes,
        is_at_max: user.daily_energy >= user.max_daily_energy
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

// Consume energy for an action
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
    
    // First get and update current energy
    const { data: user, error } = await supabase
      .from('users')
      .select('daily_energy, max_daily_energy, energy_regen_rate_minutes, last_energy_update')
      .eq('id', req.userId!)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found'
        }
      });
      return;
    }
    
    // Calculate current energy with regeneration
    const now = new Date();
    const lastUpdate = new Date(user.last_energy_update);
    const timeDiff = now.getTime() - lastUpdate.getTime();
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));
    
    let currentEnergy = user.daily_energy;
    if (minutesPassed >= user.energy_regen_rate_minutes && user.daily_energy < user.max_daily_energy) {
      const energyToAdd = Math.floor(minutesPassed / user.energy_regen_rate_minutes);
      currentEnergy = Math.min(user.daily_energy + energyToAdd, user.max_daily_energy);
    }
    
    // Check if user has enough energy
    if (currentEnergy < amount) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_ENERGY',
          message: `Not enough energy. Required: ${amount}, Available: ${currentEnergy}`
        }
      });
      return;
    }
    
    // Consume energy
    const newEnergy = currentEnergy - amount;
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        daily_energy: newEnergy,
        last_energy_update: now.toISOString()
      })
      .eq('id', req.userId!)
      .select('daily_energy, max_daily_energy, energy_regen_rate_minutes')
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        daily_energy: updatedUser.daily_energy,
        max_daily_energy: updatedUser.max_daily_energy,
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
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId!)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const response: ApiResponse<User> = {
      success: true,
      data: user
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