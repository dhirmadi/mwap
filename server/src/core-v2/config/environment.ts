import { z } from 'zod';
import { AppError } from '../errors';

/**
 * Environment variable configuration schema
 */
const envSchema = z.object({
  // Auth0 Configuration
  AUTH0_DOMAIN: z.string()
    .min(1, 'AUTH0_DOMAIN is required')
    .refine(val => val.includes('.'), 'AUTH0_DOMAIN must be a valid domain'),
  
  AUTH0_CLIENT_ID: z.string()
    .min(1, 'AUTH0_CLIENT_ID is required'),
  
  AUTH0_CLIENT_SECRET: z.string()
    .min(1, 'AUTH0_CLIENT_SECRET is required'),

  // Database Configuration
  MONGO_URI: z.string()
    .min(1, 'MONGO_URI is required')
    .startsWith('mongodb', 'MONGO_URI must be a valid MongoDB connection string'),

  // JWT Configuration
  JWT_AUDIENCE: z.string()
    .min(1, 'JWT_AUDIENCE is required')
    .url('JWT_AUDIENCE must be a valid URL'),

  // API Configuration
  CLOUD_API_TIMEOUT: z.coerce
    .number()
    .int('CLOUD_API_TIMEOUT must be an integer')
    .min(1000, 'CLOUD_API_TIMEOUT must be at least 1000ms')
    .max(30000, 'CLOUD_API_TIMEOUT cannot exceed 30000ms')
    .default(5000),

  // Optional configurations with defaults
  NODE_ENV: z.enum(['development', 'test', 'production'])
    .default('development'),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug'])
    .default('info'),
}).strict();

// Infer the type from the schema
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Load and validate environment variables
 * @throws {AppError} if validation fails
 */
function loadEnvConfig(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        variable: err.path.join('.'),
        message: err.message,
      }));

      throw new AppError(
        'Invalid environment configuration',
        'CONFIG_VALIDATION_ERROR',
        500,
        { details }
      );
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * @throws {AppError} if any required environment variables are missing or invalid
 */
export const config = loadEnvConfig();

/**
 * Type-safe config getter
 * @throws {AppError} if the config key doesn't exist
 */
export function getConfig<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  const value = config[key];
  
  if (value === undefined) {
    throw new AppError(
      `Configuration key "${key}" not found`,
      'CONFIG_KEY_NOT_FOUND',
      500
    );
  }
  
  return value;
}

// Example usage:
/*
import { config, getConfig } from '../config/environment';

// Direct access
const mongoUri = config.MONGO_URI;

// Using getter (with type inference)
const timeout = getConfig('CLOUD_API_TIMEOUT');
*/