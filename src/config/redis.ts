import Redis from 'ioredis';
import env from './env';
import { logger } from '../utils';

let redisClient: Redis | null = null;

// Create Redis connection with optimized settings for high performance
export const createRedisClient = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    
    // Connection settings
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    
    // Keep-alive settings for persistent connections
    keepAlive: 10000, // Send keep-alive every 10 seconds
    
    // Connection pool optimization
    enableOfflineQueue: true, // Queue commands when disconnected
    connectTimeout: 10000, // Connection timeout
    
    // Performance optimizations
    enableAutoPipelining: true, // Auto-batch commands for efficiency
    
    // Reconnection strategy
    retryStrategy: (times: number): number | null => {
      if (times > 10) {
        logger.error('Redis max retries reached');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000); // Exponential backoff, max 3s
    },
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully', { host: env.REDIS_HOST, port: env.REDIS_PORT });
  });

  redisClient.on('error', (error) => {
    logger.error('Redis connection error', error);
  });

  redisClient.on('close', () => {
    logger.warn('Redis connection closed');
  });

  redisClient.on('reconnecting', () => {
    logger.info('Redis reconnecting...');
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  const client = createRedisClient();
  await client.connect();
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
};

export default { createRedisClient, getRedisClient, connectRedis, disconnectRedis };

