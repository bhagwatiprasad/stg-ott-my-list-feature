import { Router } from 'express';
import { MyListController } from '../controllers/my-list-controller';
import {
  authMiddleware,
  validate,
  addToListSchema,
  listItemsQuerySchema,
  contentIdParamSchema,
  readRateLimiter,
  writeRateLimiter,
} from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/my-list
 * Get user's list with pagination (offset or cursor)
 */
router.get(
  '/',
  readRateLimiter,
  validate(listItemsQuerySchema, 'query'),
  MyListController.getList
);

/**
 * POST /api/my-list
 * Add item to user's list
 */
router.post(
  '/',
  writeRateLimiter,
  validate(addToListSchema, 'body'),
  MyListController.addToList
);

/**
 * DELETE /api/my-list/:contentId
 * Remove item from user's list
 */
router.delete(
  '/:contentId',
  writeRateLimiter,
  validate(contentIdParamSchema, 'params'),
  MyListController.removeFromList
);

export default router;

