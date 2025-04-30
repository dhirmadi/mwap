/**
 * Core configuration
 */
export const config = {
  /** Node environment */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /** Log level */
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  /** API rate limit */
  RATE_LIMIT: {
    /** Max requests per window */
    MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    /** Window size in minutes */
    WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
  },

  /** Redis configuration */
  REDIS_URL: process.env.REDIS_URL,

  /** CORS configuration */
  CORS: {
    /** Allowed origins */
    ORIGINS: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
    /** Allow credentials */
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  },

  /** Auth configuration */
  AUTH0: {
    /** Auth0 domain */
    DOMAIN: process.env.AUTH0_DOMAIN || '',
    /** Auth0 audience */
    AUDIENCE: process.env.AUTH0_AUDIENCE || '',
  },
} as const;

/**
 * Environment type guard
 */
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';