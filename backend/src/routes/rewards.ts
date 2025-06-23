import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { ApiResponse, Cat, User, AuthenticatedRequest } from '../types';

const router = Router();

// Apply auth middleware to all reward routes
router.use(authMiddleware);

interface GiveCoinsRequest {
  userId: string;
  amount: number;
  reason?: string;
}

interface GiveCoinsResponse {
  user: User;
  previousCoins: number;
  newCoins: number;
  coinsAdded: number;
}

// POST /rewards/coins - Give coins to a user
router.post('/coins', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, amount, reason } = req.body as GiveCoinsRequest;

    // Validate input
    if (!userId || amount === undefined) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'userId and amount are required'
        }
      });
      return;
    }

    if (amount < 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Amount must be non-negative'
        }
      });
      return;
    }

    // Check if the requesting user is the same as the target user
    // In the future, you might want to add admin checks here
    if (req.userId !== userId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot give coins to other users'
        }
      });
      return;
    }

    // Fetch current user data
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !userData) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    const previousCoins = userData.coins;
    const newCoins = previousCoins + amount;

    // Update user coins
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ coins: newCoins })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user coins:', updateError);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update coins'
        }
      });
      return;
    }

    // Log the transaction (optional - for future tracking)
    if (reason) {
      console.log(`Coins given: User ${userId} received ${amount} coins. Reason: ${reason}`);
    }

    const response: ApiResponse<GiveCoinsResponse> = {
      success: true,
      data: {
        user: updatedUser,
        previousCoins,
        newCoins,
        coinsAdded: amount
      }
    };

    res.json(response);
    return;
  } catch (error) {
    console.error('Error giving coins:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to give coins'
      }
    });
    return;
  }
});

interface GiveCatRequest {
  userId: string;
  cat: {
    name: string;
    gender: 'male' | 'female';
    age_moons: number;
    skill: string;
    trait: string;
    breed: string;
  };
  reason?: string;
}

interface GiveCatResponse {
  cat: Cat;
}

// POST /rewards/cats - Give a cat to a user
router.post('/cats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, cat, reason } = req.body as GiveCatRequest;

    // Validate input
    if (!userId || !cat) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'userId and cat data are required'
        }
      });
      return;
    }

    // Validate cat data
    if (!cat.name || !cat.gender || !cat.age_moons || !cat.skill || !cat.trait || !cat.breed) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'All cat fields are required: name, gender, age_moons, skill, trait, breed'
        }
      });
      return;
    }

    // Check if the requesting user is the same as the target user
    if (req.userId !== userId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot give cats to other users'
        }
      });
      return;
    }

    // Create the new cat
    const newCatData = {
      ...cat,
      user_id: userId,
      level: 1,
      experience: 0,
      max_level: 20
    };

    const { data: newCat, error: createError } = await supabase
      .from('cats')
      .insert(newCatData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating cat:', createError);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create cat'
        }
      });
      return;
    }

    // Log the transaction
    if (reason) {
      console.log(`Cat given: User ${userId} received cat "${cat.name}". Reason: ${reason}`);
    }

    const response: ApiResponse<GiveCatResponse> = {
      success: true,
      data: {
        cat: newCat
      }
    };

    res.json(response);
    return;
  } catch (error) {
    console.error('Error giving cat:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to give cat'
      }
    });
    return;
  }
});

interface GiveExperienceRequest {
  catId: string;
  amount: number;
  reason?: string;
}

interface GiveExperienceResponse {
  cat: Cat;
  previousExperience: number;
  newExperience: number;
  experienceAdded: number;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
}

// POST /rewards/experience - Give experience to a cat
router.post('/experience', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { catId, amount, reason } = req.body as GiveExperienceRequest;

    // Validate input
    if (!catId || amount === undefined) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'catId and amount are required'
        }
      });
      return;
    }

    if (amount < 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Amount must be non-negative'
        }
      });
      return;
    }

    // Fetch the cat and verify ownership
    const { data: catData, error: fetchError } = await supabase
      .from('cats')
      .select('*')
      .eq('id', catId)
      .eq('user_id', req.userId!)
      .single();

    if (fetchError || !catData) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Cat not found or does not belong to user'
        }
      });
      return;
    }

    const previousExperience = catData.experience;
    const previousLevel = catData.level;
    const newExperience = previousExperience + amount;

    // Calculate new level based on experience
    // Simple formula: level = floor(experience / 100) + 1, capped at max_level
    const newLevel = Math.min(
      Math.floor(newExperience / 100) + 1,
      catData.max_level
    );

    // Update cat experience and level
    const { data: updatedCat, error: updateError } = await supabase
      .from('cats')
      .update({ 
        experience: newExperience,
        level: newLevel
      })
      .eq('id', catId)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating cat experience:', updateError);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update experience'
        }
      });
      return;
    }

    // Log the transaction
    if (reason) {
      console.log(`Experience given: Cat ${catId} received ${amount} experience. Reason: ${reason}`);
    }

    const response: ApiResponse<GiveExperienceResponse> = {
      success: true,
      data: {
        cat: updatedCat,
        previousExperience,
        newExperience,
        experienceAdded: amount,
        leveledUp: newLevel > previousLevel,
        previousLevel,
        newLevel
      }
    };

    res.json(response);
    return;
  } catch (error) {
    console.error('Error giving experience:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to give experience'
      }
    });
    return;
  }
});

export default router;