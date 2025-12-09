import { Router } from 'express';
import myListRoutes from './my-list-routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/my-list', myListRoutes);

export default router;

