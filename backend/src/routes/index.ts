import { Router } from 'express';
import catsRouter from './cats';
import expeditionsRouter from './expeditions';
import marketplaceRouter from './marketplace';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1'
    }
  });
});

// Mount route modules
router.use('/cats', catsRouter);
router.use('/expeditions', expeditionsRouter);
router.use('/marketplace', marketplaceRouter);

export default router;