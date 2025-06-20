import { Router } from 'express';
import authRouter from './auth';
import catsRouter from './cats';

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

export default router;