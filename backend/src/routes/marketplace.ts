import { Router, Response } from 'express';
import { AuthenticatedRequest, ApiResponse, MarketplaceListing, PaginationQuery } from '../types';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get marketplace listings
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      type,
      minPrice,
      maxPrice
    } = req.query as PaginationQuery & { type?: 'cat' | 'item'; minPrice?: number; maxPrice?: number };
    
    // TODO: Implement actual database query with filters
    const mockListings: MarketplaceListing[] = [
      {
        id: 'listing-1',
        sellerId: 'user-456',
        catId: 'cat-789',
        price: 1000,
        currency: 'coins',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'listing-2',
        sellerId: 'user-789',
        itemId: 'item-123',
        price: 50,
        currency: 'gems',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const response: ApiResponse<MarketplaceListing[]> = {
      success: true,
      data: mockListings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: mockListings.length
      }
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch marketplace listings'
      }
    });
  }
});

// Get specific listing
router.get('/:listingId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    
    // TODO: Implement actual database query
    const mockListing: MarketplaceListing = {
      id: listingId,
      sellerId: 'user-456',
      catId: 'cat-789',
      price: 1000,
      currency: 'coins',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const response: ApiResponse<MarketplaceListing> = {
      success: true,
      data: mockListing
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch listing'
      }
    });
  }
});

// Create new listing
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catId, itemId, price, currency } = req.body;
    
    // Validate input
    if ((!catId && !itemId) || (catId && itemId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Must provide either catId or itemId, not both'
        }
      });
      return;
    }
    
    if (!price || price <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Price must be greater than 0'
        }
      });
      return;
    }
    
    if (!currency || !['coins', 'gems'].includes(currency)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid currency type'
        }
      });
      return;
    }
    
    // TODO: Implement actual listing creation
    // - Verify ownership of cat/item
    // - Check if cat/item is already listed
    // - Create listing in database
    
    const newListing: MarketplaceListing = {
      id: 'listing-new',
      sellerId: req.userId!,
      catId,
      itemId,
      price,
      currency,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const response: ApiResponse<MarketplaceListing> = {
      success: true,
      data: newListing
    };
    
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create listing'
      }
    });
  }
});

// Purchase listing
router.post('/:listingId/purchase', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    
    // TODO: Implement actual purchase logic
    // - Check if listing is still active
    // - Check if buyer has enough currency
    // - Transfer ownership
    // - Update listing status
    // - Process payment
    
    const response: ApiResponse<{ transactionId: string }> = {
      success: true,
      data: {
        transactionId: 'txn-123'
      }
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to complete purchase'
      }
    });
  }
});

// Cancel listing
router.delete('/:listingId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    
    // TODO: Implement actual cancellation logic
    // - Verify ownership
    // - Check if listing can be cancelled
    // - Update status
    
    const response: ApiResponse = {
      success: true
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to cancel listing'
      }
    });
  }
});

export default router;