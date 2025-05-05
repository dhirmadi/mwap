import { z } from 'zod';
import { logger } from '../logger';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  API_VERSION: z.string().default('v2'),

  // Database
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/mwap'),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Auth0
  AUTH0_DOMAIN: z.string().url(),
  AUTH0_CLIENT_ID: z.string(),
  AUTH0_CLIENT_SECRET: z.string(),
  AUTH0_AUDIENCE: z.string().url(),

  // Storage
  STORAGE_PROVIDER: z.enum(['dropbox', 'gdrive', 'box', 'onedrive']).default('dropbox'),
  STORAGE_API_KEY: z.string(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Optional
  ENCRYPTION_KEY: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

/**
 * Validate environment variables
 */
export function validateEnv(): EnvConfig {
  try {
    config = envSchema.parse(process.env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Environment validation failed:', error.errors);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Get validated config
 */
export function getConfig(): EnvConfig {
  if (!config) {
    return validateEnv();
  }
  return config;
}