/**
 * My List Feature - OTT Platform Backend
 * @author Bhagwati Prasad
 * @description High-performance API for managing user's personalized "My List"
 */

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import env from './config/env';
import { logger } from './utils';
import { seedDatabase } from '../scripts/seed';

/**
 * Start the server with optimized settings
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();

    // Seed database with initial data (only if empty)
    await seedDatabase();

    // Create Express app
    const app = createApp();

    // Start server with Keep-Alive optimization
    const server = app.listen(env.PORT, () => {
      logger.startup({
        port: env.PORT,
        environment: env.NODE_ENV,
      });
    });

    // HTTP Keep-Alive settings for persistent connections
    // Reduces TCP handshake overhead for repeated requests
    server.keepAliveTimeout = 65000; // Keep connections alive for 65s (must be > load balancer timeout)
    server.headersTimeout = 66000; // Headers timeout slightly higher than keepAliveTimeout
    
    // Increase max connections for high concurrency
    server.maxConnections = 0; // Unlimited (rely on OS limits)

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.shutdown(signal);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connections
        const { disconnectDatabase } = await import('./config/database');
        const { disconnectRedis } = await import('./config/redis');
        
        await disconnectDatabase();
        await disconnectRedis();
        
        logger.info('All connections closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.fatal('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.fatal('Failed to start server', error as Error);
    process.exit(1);
  }
};

void startServer();

