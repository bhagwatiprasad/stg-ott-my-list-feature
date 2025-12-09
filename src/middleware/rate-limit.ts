import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import env from '../config/env';
import { ERRORS } from '../constants';

/**
 * Custom key generator that uses user ID if present, otherwise IP
 */
const keyGenerator = (req: Request): string => {
  const userId = req.headers['x-user-id'];
  if (typeof userId === 'string') {
    return userId;
  }
  return req.ip || 'unknown';
};

/**
 * Rate limiter for read operations (higher limit)
 */
export const readRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS * 10, // 1000 requests per minute for reads
  message: {
    success: false,
    error: ERRORS.TOO_MANY_REQUESTS,
    details: [ERRORS.RATE_LIMIT_EXCEEDED],
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  validate: { default: false },
});

/**
 * Rate limiter for write operations (lower limit)
 */
export const writeRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS, // 100 requests per minute for writes
  message: {
    success: false,
    error: ERRORS.TOO_MANY_REQUESTS,
    details: [ERRORS.RATE_LIMIT_EXCEEDED],
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  validate: { default: false },
});

export default { readRateLimiter, writeRateLimiter };

