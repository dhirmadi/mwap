import type { Application, Request, RequestHandler } from 'express';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { AppError } from '../../core-v2/errors';
import { config } from '../../core-v2/config';
import { logger } from '../../logging-v2';

/**
 * Helmet security configuration
 * https://helmetjs.github.io/
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Vite HMR
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'https://*.auth0.com',
        'https://*.herokuapp.com',
        process.env.NODE_ENV === 'development' ? 'http://localhost:*' : '',
      ].filter(Boolean),
      frameSrc: ["'self'", 'https://*.auth0.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Auth0 iframe
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
} as const;

/**
 * CORS configuration
 * https://github.com/expressjs/cors
 */
/**
 * CORS configuration type
 */
export type CorsConfig = {
  origin: (string | RegExp)[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
};

/**
 * CORS configuration
 * https://github.com/expressjs/cors
 */
export const corsConfig: CorsConfig = {
  origin: [
    'http://localhost:5173', // Vite dev server
    /\.herokuapp\.com$/, // Heroku domains
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'Accept',
    'X-Requested-With',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
} as const;

/**
 * Rate limiter configuration options
 */
/**
 * Redis configuration for rate limiter
 */
export interface RedisConfig {
  /** Redis connection URL */
  url: string;
  /** Key prefix for rate limiter */
  prefix?: string;
}

/**
 * Rate limiter configuration options
 */
export interface RateLimiterOptions {
  /**
   * Maximum number of requests per window
   * @default 100
   */
  max?: number;

  /**
   * Time window in milliseconds
   * @default 900000 (15 minutes)
   */
  windowMs?: number;

  /**
   * Skip rate limiting for certain requests
   * @default undefined
   */
  skip?: (req: Request) => boolean;

  /**
   * Use Redis instead of memory store
   * @default false
   */
  useRedis?: boolean;

  /**
   * Redis connection options (required if useRedis is true)
   */
  redis?: RedisConfig;
}

/**
 * Create a rate limiter middleware
 */
/**
 * Create a rate limiter middleware
 * 
 * @throws {AppError} If Redis is enabled but configuration is missing
 */
export async function createRateLimiter(options: RateLimiterOptions = {}): Promise<RequestHandler> {
  const {
    max = 100, // 100 requests per window
    windowMs = 15 * 60 * 1000, // 15 minutes
    useRedis = false,
    redis,
    skip,
  } = options;

  // Base configuration for both memory and Redis stores
  const baseConfig = {
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip, // Optional skip function
    handler: (_req, _res, next) => {
      next(new AppError(
        'Too many requests, please try again later.',
        'RATE_LIMIT_EXCEEDED',
        429,
        {
          retryAfter: Math.ceil(windowMs / 1000), // seconds
          limit: max,
          windowMs,
        }
      ));
    },
    keyGenerator: (req: Request): string => {
      // Use X-Forwarded-For if available (e.g., behind proxy)
      const realIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
      return `${realIp}:${req.method}:${req.path}`;
    },
  };

  // Use in-memory store
  if (!useRedis) {
    return rateLimit(baseConfig);
  }

  // Validate Redis configuration
  if (!redis?.url) {
    throw new AppError(
      'Redis configuration required when useRedis is true',
      'INVALID_CONFIG',
      500,
      { requiredConfig: ['redis.url'] }
    );
  }

  try {
    // Create Redis client
    const client = createClient({
      url: redis.url,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000), // Exponential backoff
      },
    });

    // Handle Redis errors
    client.on('error', (err) => {
      logger.error('Redis rate limiter error', { error: err });
    });

    await client.connect();

    // Create rate limiter with Redis store
    return rateLimit({
      ...baseConfig,
      store: new RedisStore({
        sendCommand: (...args: string[]) => client.sendCommand(args),
        prefix: redis.prefix ?? 'rl:v2:',
        // Reconnect handling is managed by client configuration
      }),
    });
  } catch (error) {
    // Log Redis connection error and fallback to memory store
    logger.error('Failed to initialize Redis rate limiter, falling back to memory store', {
      error,
      useRedis,
      redisUrl: redis.url,
    });
    return rateLimit(baseConfig);
  }
}

/**
 * Apply all security middleware to an Express application
 */
/**
 * Apply security middleware to an Express application
 * 
 * @param app Express application
 * @param rateLimiterOptions Optional rate limiter configuration
 * @returns Promise that resolves when security middleware is applied
 * 
 * @example
 * ```typescript
 * const app = express();
 * 
 * await applySecurity(app, {
 *   max: 100,
 *   windowMs: 15 * 60 * 1000,
 *   useRedis: true,
 *   redis: {
 *     url: config.REDIS_URL,
 *     prefix: 'api:v2:ratelimit:',
 *   },
 * });
 * ```
 */
export async function applySecurity(
  app: Application,
  rateLimiterOptions?: RateLimiterOptions
): Promise<void> {
  try {
    // Disable X-Powered-By header
    app.disable('x-powered-by');

    // Apply Helmet security headers globally
    app.use(helmet(helmetConfig));

    // Parse JSON payloads with size limit globally
    app.use(express.json({ limit: '1mb' }));

    // Additional security headers globally
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    // Apply CORS and rate limiting only to /api/v2 routes
    const v2Router = express.Router();
    
    // Apply CORS
    v2Router.use(cors(corsConfig));

    // Create and apply rate limiter
    const limiter = await createRateLimiter({
      ...rateLimiterOptions,
      // Skip rate limiting for OPTIONS requests (CORS preflight)
      skip: (req) => req.method === 'OPTIONS',
    });
    v2Router.use(limiter);

    // Mount v2 router
    app.use('/api/v2', v2Router);

    logger.info('Security middleware applied successfully', {
      cors: true,
      rateLimiting: true,
      helmet: true,
      apiPath: '/api/v2',
    });
  } catch (error) {
    logger.error('Failed to apply security middleware', { error });
    throw new AppError(
      'Failed to initialize security middleware',
      'SECURITY_INIT_ERROR',
      500,
      { originalError: error }
    );
  }
}

// Example usage:
/*
import { applySecurity } from '../middleware-v2/security';

const app = express();

await applySecurity(app, {
  max: 100,
  windowMs: 60 * 1000,
  useRedis: true,
  redis: {
    url: config.REDIS_URL,
    prefix: 'api:ratelimit:',
  },
});
*/