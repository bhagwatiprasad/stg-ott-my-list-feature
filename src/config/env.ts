import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  
  // Redis configuration - supports both REDIS_URL (cloud) and individual vars (local)
  REDIS_URL: z.string().optional(), // Cloud platforms (Railway, Fly.io, Render)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  DEFAULT_PAGE_LIMIT: z.string().default('10').transform(Number),
  MAX_PAGE_LIMIT: z.string().default('100').transform(Number),
  CACHE_TTL_SECONDS: z.string().default('300').transform(Number), // 5 minutes cache TTL
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  SERVICE_NAME: z.string().default('my-list-api'),
});

// Parse and validate environment
const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();

export default env;

