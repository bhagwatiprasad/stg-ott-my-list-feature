import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger, runWithContext } from '../utils';

/**
 * Request Logger Middleware
 * 
 * Features:
 * - Generates unique request ID for tracing
 * - Logs incoming requests and outgoing responses
 * - Tracks response time
 * - Adds request context to all logs within the request lifecycle
 * - Attaches request ID to response headers
 */

// Extend Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
      startTime: [number, number];
    }
  }
}

/**
 * Generate request ID (short UUID for readability in logs)
 */
const generateRequestId = (): string => {
  return randomUUID();
};

/**
 * Calculate response time in milliseconds
 */
const getResponseTime = (startTime: [number, number]): number => {
  const diff = process.hrtime(startTime);
  return Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;
};

/**
 * Get client IP address
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate request ID
  const requestId = generateRequestId();
  const startTime = process.hrtime();
  
  // Attach to request object
  req.requestId = requestId;
  req.startTime = startTime;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Get user ID if present
  const userId = req.headers['x-user-id'] as string | undefined;
  
  // Create request context for async local storage
  const context = {
    requestId,
    userId,
  };
  
  // Log incoming request (debug level)
  logger.debug(`Incoming ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    userAgent: req.headers['user-agent'],
    ip: getClientIp(req),
  });
  
  // Capture response finish
  res.on('finish', () => {
    const responseTime = getResponseTime(startTime);
    const contentLength = parseInt(res.getHeader('content-length') as string, 10) || 0;
    
    // Log completed request
    logger.http({
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      contentLength,
      userAgent: req.headers['user-agent'],
      ip: getClientIp(req),
    });
  });
  
  // Run the rest of the request in context
  runWithContext(context, () => {
    next();
  });
};

/**
 * Slow request detector middleware
 * Logs warning for requests that take longer than threshold
 */
export const slowRequestDetector = (thresholdMs: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime();
    
    res.on('finish', () => {
      const diff = process.hrtime(startTime);
      const responseTime = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;
      
      if (responseTime > thresholdMs) {
        logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
          responseTime,
          threshold: thresholdMs,
          statusCode: res.statusCode,
        });
      }
    });
    
    next();
  };
};

export default requestLogger;

