import { Request, Response, NextFunction } from 'express';
import { MyListService } from '../services';
import type { ApiResponse, PaginatedResponse, AddToListRequest, PaginationType } from '../types';
import { listItemsQuerySchema } from '../middleware/validate';
import { z } from 'zod';
import { SUCCESS } from '../constants';

// Response type for list item
interface ListItemResponse {
  id: string;
  contentId: string;
  contentType: string;
  title: string;
  description: string;
  genres: string[];
  releaseDate: Date;
  director?: string;
  actors: string[];
  addedAt: Date;
}

/**
 * MyList Controller - Request handlers
 */
export class MyListController {
  /**
   * POST /api/my-list
   * Add item to user's list
   */
  static async addToList(
    req: Request<object, ApiResponse<ListItemResponse>, AddToListRequest>,
    res: Response<ApiResponse<ListItemResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { contentId, contentType } = req.body;

      const item = await MyListService.addToList(userId, contentId, contentType);

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/my-list/:contentId
   * Remove item from user's list
   */
  static async removeFromList(
    req: Request<{ contentId: string }>,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { contentId } = req.params;

      await MyListService.removeFromList(userId, contentId);

      res.status(200).json({
        success: true,
        message: SUCCESS.ITEM_REMOVED,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/my-list
   * Get user's list with pagination
   */
  static async getList(
    req: Request,
    res: Response<PaginatedResponse<ListItemResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      
      // Get validated query params
      const validatedQuery = req.validatedQuery as z.infer<typeof listItemsQuerySchema>;
      const { type, page, limit, cursor } = validatedQuery;

      const result = await MyListService.getList(userId, type as PaginationType, {
        page,
        limit,
        cursor,
      });

      // Set cache status header (production standard like CDNs)
      res.setHeader('X-Cache', result.cacheHit ? 'HIT' : 'MISS');

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MyListController;

