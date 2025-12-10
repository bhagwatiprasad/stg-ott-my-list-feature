/**
 * Express Application Configuration
 * @author Bhagwati Prasad
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import { errorHandler, notFoundHandler, requestLogger, slowRequestDetector } from './middleware';

/**
 * Create and configure Express application
 * Optimized for high performance and scalability
 */
export const createApp = (): Application => {
  const app = express();

  // Enable ETag for client-side caching (weak ETags for dynamic content)
  app.set('etag', 'weak');
  
  // Trust proxy for proper IP detection behind load balancers
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet());

  // CORS configuration with caching headers
  app.use(
    cors({
      origin: '*', // Configure for production
      methods: ['GET', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'x-user-id', 'If-None-Match'], // Allow ETag header
      exposedHeaders: ['ETag', 'X-Response-Time', 'X-Request-ID'], // Expose performance headers
    })
  );

  // Compression middleware for better performance (gzip/brotli)
  app.use(compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't accept it
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // Body parsing with size limits for security
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Request logging with context tracking
  app.use(requestLogger);
  
  // Slow request detection (>1000ms)
  app.use(slowRequestDetector(1000));

  // Response time header
  app.use((_req, res, next) => {
    const startTime = process.hrtime();
    
    const originalSend = res.send.bind(res);
    res.send = function (body: unknown) {
      const diff = process.hrtime(startTime);
      const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${responseTime}ms`);
      }
      
      return originalSend(body);
    } as typeof res.send;
    
    next();
  });

  // Health check endpoint (for deployment platforms)
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;

