import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { supabase } from '../lib/supabase';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header'
        }
      });
      return;
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      });
      return;
    }

    req.userId = user.id;
    req.user = user;
    req.sessionId = `session-${user.id}-${Date.now()}`;
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error occurred'
      }
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.userId = user.id;
        req.user = user;
        req.sessionId = `session-${user.id}-${Date.now()}`;
      }
    } catch (error) {
      console.error('Optional auth error:', error);
    }
  }
  
  next();
};