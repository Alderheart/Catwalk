import { Router } from 'express';
import authRouter from './auth';
import catsRouter from './cats';
import expeditionsRouter from './expeditions';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
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
router.use('/auth', authRouter);
router.use('/cats', catsRouter);
router.use('/expeditions', expeditionsRouter);

export default router;