/**
 * My List Service - Core Business Logic
 * @author Bhagwati Prasad
 * @description Handles add, remove, and list operations with Redis caching
 */

import { MyListItem, Movie, TVShow } from '../models';
import { CacheService } from './cache-service';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/error-handler';
import { ERRORS, VALIDATION } from '../constants';
import type {
  ContentType,
  PaginationType,
  OffsetPagination,
  CursorPagination,
  Genre,
} from '../types';

// Types for service responses
interface ListItemData {
  id: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: Date;
  director?: string;
  actors: string[];
  addedAt: Date;
}

// Internal result without cache info
interface ListResult {
  items: ListItemData[];
  pagination: OffsetPagination | CursorPagination;
}

// Public result with cache status
interface PaginatedListResult extends ListResult {
  cacheHit: boolean;
}

type CachedListData = ListResult;

/**
 * MyList Service - Business logic with caching
 */
export class MyListService {
  /**
   * Add item to user's list
   */
  static async addToList(
    userId: string,
    contentId: string,
    contentType: ContentType
  ): Promise<ListItemData> {
    // Check if item already exists
    const existingItem = await MyListItem.findOne({
      user_id: userId,
      content_id: contentId,
    }).lean();

    if (existingItem) {
      throw new ConflictError(ERRORS.ITEM_ALREADY_IN_LIST);
    }

    // Fetch content data based on type
    let contentData: {
      title: string;
      description: string;
      genres: Genre[];
      releaseDate: Date;
      director?: string;
      actors: string[];
    };

    if (contentType === 'movie') {
      const movie = await Movie.findById(contentId).lean();
      if (!movie) {
        throw new NotFoundError(ERRORS.MOVIE_NOT_FOUND);
      }
      contentData = {
        title: movie.title,
        description: movie.description,
        genres: movie.genres as Genre[],
        releaseDate: movie.releaseDate,
        director: movie.director,
        actors: movie.actors,
      };
    } else {
      const tvShow = await TVShow.findById(contentId).lean();
      if (!tvShow) {
        throw new NotFoundError(ERRORS.TV_SHOW_NOT_FOUND);
      }
      // Get first episode date and aggregate actors
      const firstEpisode = tvShow.episodes[0];
      const allActors = [...new Set(tvShow.episodes.flatMap((ep) => ep.actors))];
      contentData = {
        title: tvShow.title,
        description: tvShow.description,
        genres: tvShow.genres as Genre[],
        releaseDate: firstEpisode?.releaseDate || new Date(),
        director: firstEpisode?.director,
        actors: allActors,
      };
    }

    // Create new list item with denormalized data
    const newItem = await MyListItem.create({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      added_at: new Date(),
      title: contentData.title,
      description: contentData.description,
      genres: contentData.genres,
      release_date: contentData.releaseDate,
      director: contentData.director,
      actors: contentData.actors,
    });

    // Invalidate user's cache
    await CacheService.invalidateUserCache(userId);

    return {
      id: newItem._id.toString(),
      contentId: newItem.content_id,
      contentType: newItem.content_type,
      title: newItem.title,
      description: newItem.description,
      genres: newItem.genres as Genre[],
      releaseDate: newItem.release_date,
      director: newItem.director,
      actors: newItem.actors,
      addedAt: newItem.added_at,
    };
  }

  /**
   * Remove item from user's list
   */
  static async removeFromList(userId: string, contentId: string): Promise<void> {
    const result = await MyListItem.deleteOne({
      user_id: userId,
      content_id: contentId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError(ERRORS.ITEM_NOT_IN_LIST);
    }

    // Invalidate user's cache
    await CacheService.invalidateUserCache(userId);
  }

  /**
   * Get user's list with pagination
   */
  static async getList(
    userId: string,
    type: PaginationType,
    params: { page?: number; limit?: number; cursor?: string }
  ): Promise<PaginatedListResult> {
    const limit = params.limit || 10;

    // Generate cache key
    const cacheKey = CacheService.getCacheKey(userId, type, {
      page: params.page,
      cursor: params.cursor,
      limit,
    });

    // Check cache first
    const cached = await CacheService.get<CachedListData>(cacheKey);
    if (cached.hit && cached.data) {
      return { ...cached.data, cacheHit: true };
    }

    // Fetch from database
    let result: ListResult;

    if (type === 'offset') {
      result = await this.getListWithOffsetPagination(userId, params.page || 1, limit);
    } else {
      result = await this.getListWithCursorPagination(userId, params.cursor, limit);
    }

    // Cache the result
    await CacheService.set(cacheKey, result);

    return { ...result, cacheHit: false };
  }

  /**
   * Get list with offset pagination
   */
  private static async getListWithOffsetPagination(
    userId: string,
    page: number,
    limit: number
  ): Promise<ListResult> {
    const skip = (page - 1) * limit;

    // Get total count and items in parallel
    const [totalItems, items] = await Promise.all([
      MyListItem.countDocuments({ user_id: userId }),
      MyListItem.find({ user_id: userId })
        .sort({ added_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const pagination: OffsetPagination = {
      type: 'offset',
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      items: items.map((item) => this.mapToListItemData(item)),
      pagination,
    };
  }

  /**
   * Get list with cursor pagination
   */
  private static async getListWithCursorPagination(
    userId: string,
    cursor: string | undefined,
    limit: number
  ): Promise<ListResult> {
    let cursorDate: Date | null = null;
    let decodedCursor: { added_at: string; id?: string } | null = null;

    // Decode cursor if provided
    if (cursor) {
      try {
        decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
        if (decodedCursor?.added_at) {
           cursorDate = new Date(decodedCursor.added_at);
        }
        
        if (!cursorDate || isNaN(cursorDate.getTime())) {
          throw new BadRequestError(VALIDATION.INVALID_CURSOR);
        }
      } catch {
        throw new BadRequestError(VALIDATION.INVALID_CURSOR_FORMAT);
      }
    }

    // Build query
    interface CursorQuery {
      user_id: string;
      added_at?: { $lt: Date };
      $or?: Array<{ added_at: Date | { $lt: Date }; _id?: { $lt: string } }>;
    }
    const query: CursorQuery = { user_id: userId };
    
    if (cursorDate) {
      if (decodedCursor && decodedCursor.id) {
         // Deterministic pagination with tie-breaker
         query.$or = [
           { added_at: { $lt: cursorDate } },
           { 
             added_at: cursorDate,
             _id: { $lt: decodedCursor.id }
           }
         ];
      } else {
         // Fallback for old cursors (less accurate)
         query.added_at = { $lt: cursorDate };
      }
    }

    // Fetch one extra item to check if there's a next page
    // Sort by added_at DESC, then _id DESC for consistency
    const items = await MyListItem.find(query)
      .sort({ added_at: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, limit) : items;

    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasNextPage && resultItems.length > 0) {
      const lastItem = resultItems[resultItems.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({ 
          added_at: lastItem.added_at.toISOString(),
          id: String(lastItem._id) 
        })
      ).toString('base64');
    }

    const pagination: CursorPagination = {
      type: 'cursor',
      limit,
      nextCursor,
      prevCursor: cursor || null,
      hasNextPage,
      hasPrevPage: !!cursor,
    };

    return {
      items: resultItems.map((item) => this.mapToListItemData(item)),
      pagination,
    };
  }

  /**
   * Map database item to response format
   */
  private static mapToListItemData(item: {
    _id: unknown;
    content_id: string;
    content_type: string;
    title: string;
    description: string;
    genres: string[];
    release_date: Date;
    director?: string;
    actors: string[];
    added_at: Date;
  }): ListItemData {
    return {
      id: String(item._id),
      contentId: item.content_id,
      contentType: item.content_type as ContentType,
      title: item.title,
      description: item.description,
      genres: item.genres as Genre[],
      releaseDate: item.release_date,
      director: item.director,
      actors: item.actors,
      addedAt: item.added_at,
    };
  }
}

export default MyListService;

