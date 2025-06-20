import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import { supabase } from '../lib/supabase';

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

export default router;