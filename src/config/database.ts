import mongoose from 'mongoose';
import env from './env';
import { logger } from '../utils';

// MongoDB connection options with pooling and keep-alive
const mongooseOptions: mongoose.ConnectOptions = {
  // Connection pooling
  maxPoolSize: 100, // Maximum number of connections in the pool
  minPoolSize: 10, // Minimum number of connections in the pool
  
  // Keep-alive settings for persistent connections
  maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
  
  // Timeout settings
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
  connectTimeoutMS: 10000, // Initial connection timeout
  
  // Write concern for performance (can use 'majority' for durability)
  w: 1, // Acknowledge writes from primary only (faster)
  
  // Read preference for scalability
  readPreference: 'primaryPreferred', // Read from primary, fallback to secondary
  
  // Compression for network efficiency
  compressors: ['zlib', 'snappy'],
};

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, mongooseOptions);
    logger.info('MongoDB connected successfully', { poolSize: mongooseOptions.maxPoolSize });

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    logger.fatal('MongoDB connection failed', error as Error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', error as Error);
  }
};

export default { connectDatabase, disconnectDatabase };

