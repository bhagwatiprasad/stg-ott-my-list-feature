import { getRedisClient } from '../config/redis';
import env from '../config/env';
import type { PaginationType } from '../types';
import { logger } from '../utils';

// Cache TTL from environment (default 5 minutes, balances freshness vs performance)
const CACHE_TTL_SECONDS = env.CACHE_TTL_SECONDS;

/**
 * Cache service for Redis operations
 * Handles caching for MyList with support for both offset and cursor pagination
 * 
 * Performance optimizations:
 * - TTL-based expiration to prevent memory leaks
 * - Auto-pipelining enabled at Redis client level
 * - Efficient SCAN-based invalidation
 */
export class CacheService {
  /**
   * Generate cache key for offset pagination
   */
  static getOffsetCacheKey(userId: string, page: number, limit: number): string {
    return `mylist:${userId}:offset:page:${page}:limit:${limit}`;
  }

  /**
   * Generate cache key for cursor pagination
   */
  static getCursorCacheKey(userId: string, cursor: string | null, limit: number): string {
    const cursorPart = cursor || 'first';
    return `mylist:${userId}:cursor:${cursorPart}:limit:${limit}`;
  }

  /**
   * Generate cache key pattern for user (for invalidation)
   */
  static getUserCachePattern(userId: string): string {
    return `mylist:${userId}:*`;
  }

  /**
   * Get cached data - returns { data, hit } for cache status tracking
   */
  static async get<T>(key: string): Promise<{ data: T; hit: true } | { data: null; hit: false }> {
    try {
      const redis = getRedisClient();
      const data = await redis.get(key);
      if (!data) {
        logger.debug('Cache MISS', { key });
        return { data: null, hit: false };
      }
      logger.debug('Cache HIT', { key });
      return { data: JSON.parse(data) as T, hit: true };
    } catch (error) {
      logger.error('Cache get error', error as Error, { key });
      return { data: null, hit: false };
    }
  }

  /**
   * Set cached data with TTL for automatic expiration
   * TTL ensures memory doesn't grow unbounded while write-through invalidation
   * ensures data freshness on mutations
   */
  static async set<T>(key: string, data: T, ttlSeconds: number = CACHE_TTL_SECONDS): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      logger.debug('Cache SET', { key, ttl: ttlSeconds });
    } catch (error) {
      logger.error('Cache set error', error as Error, { key });
    }
  }

  /**
   * Delete a specific cache key
   */
  static async delete(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error', error as Error, { key });
    }
  }

  /**
   * Invalidate all cache keys for a user
   */
  static async invalidateUserCache(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const pattern = this.getUserCachePattern(userId);
      let cursor = '0';
      const keysToDelete: string[] = [];

      do {
        const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        keysToDelete.push(...result[1]);
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
        logger.debug('Cache invalidated', { userId, keysDeleted: keysToDelete.length });
      }
    } catch (error) {
      logger.error('Cache invalidation error', error as Error, { userId });
    }
  }

  /**
   * Get cache key based on pagination type
   */
  static getCacheKey(
    userId: string,
    type: PaginationType,
    params: { page?: number; cursor?: string | null; limit: number }
  ): string {
    if (type === 'offset') {
      return this.getOffsetCacheKey(userId, params.page || 1, params.limit);
    }
    return this.getCursorCacheKey(userId, params.cursor || null, params.limit);
  }
}

export default CacheService;

