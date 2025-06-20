import { Router, Response } from 'express';
import { AuthenticatedRequest, ApiResponse, Cat, PaginationQuery } from '../types';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// Get all cats for authenticated user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query as PaginationQuery;
    const offset = (Number(page) - 1) * Number(limit);
    
    const { data: cats, error, count } = await supabase
      .from('cats')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + Number(limit) - 1);
    
    if (error) {
      throw error;
    }
    
    const response: ApiResponse<Cat[]> = {
      success: true,
      data: cats || [],
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching cats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch cats'
      }
    });
  }
});

// Get specific cat by ID
router.get('/:catId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catId } = req.params;
    
    const { data: cat, error } = await supabase
      .from('cats')
      .select('*')
      .eq('id', catId)
      .eq('user_id', req.userId!)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cat not found'
          }
        });
        return;
      }
      throw error;
    }
    
    const response: ApiResponse<Cat> = {
      success: true,
      data: cat
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching cat:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch cat'
      }
    });
  }
});

// Create new cat
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, gender, skill, trait } = req.body;
    
    if (!name || typeof name !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Cat name is required'
        }
      });
      return;
    }
    
    if (!gender || !['male', 'female'].includes(gender)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Valid gender (male/female) is required'
        }
      });
      return;
    }
    
    const newCatData = {
      name,
      gender,
      moons: 6, // Starting age
      skill: skill || 'hunting',
      trait: trait || 'loyal',
      user_id: req.userId!
    };
    
    const { data: newCat, error } = await supabase
      .from('cats')
      .insert(newCatData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const response: ApiResponse<Cat> = {
      success: true,
      data: newCat
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating cat:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create cat'
      }
    });
  }
});

// Update cat
router.patch('/:catId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catId } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;
    delete updates.updated_at;
    
    // Validate gender if provided
    if (updates.gender && !['male', 'female'].includes(updates.gender)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid gender value'
        }
      });
      return;
    }
    
    const { data: updatedCat, error } = await supabase
      .from('cats')
      .update(updates)
      .eq('id', catId)
      .eq('user_id', req.userId!)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cat not found'
          }
        });
        return;
      }
      throw error;
    }
    
    const response: ApiResponse<Cat> = {
      success: true,
      data: updatedCat
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating cat:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update cat'
      }
    });
  }
});

// Delete cat
router.delete('/:catId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catId } = req.params;
    
    const { error } = await supabase
      .from('cats')
      .delete()
      .eq('id', catId)
      .eq('user_id', req.userId!);
    
    if (error) {
      throw error;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting cat:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete cat'
      }
    });
  }
});

export default router;