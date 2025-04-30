import type { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { AppError } from '../../core-v2/errors';
import { config } from '../../core-v2/config';

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
export const corsConfig = {
  origin: [
    'http://localhost:5173', // Vite dev server
    /\.herokuapp\.com$/, // Heroku domains
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '', // Local development
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24 hours
} as const;

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
   * Use Redis instead of memory store
   * @default false
   */
  useRedis?: boolean;

  /**
   * Redis connection options (required if useRedis is true)
   */
  redis?: {
    url: string;
    prefix?: string;
  };
}

/**
 * Create a rate limiter middleware
 */
export async function createRateLimiter(options: RateLimiterOptions = {}) {
  const {
    max = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes
    useRedis = false,
    redis,
  } = options;

  const baseConfig = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(new AppError(
        'Too many requests, please try again later.',
        'RATE_LIMIT_EXCEEDED',
        429
      ));
    },
  };

  if (!useRedis) {
    return rateLimit(baseConfig);
  }

  if (!redis?.url) {
    throw new AppError(
      'Redis configuration required when useRedis is true',
      'INVALID_CONFIG',
      500
    );
  }

  const client = createClient({
    url: redis.url,
  });

  await client.connect();

  return rateLimit({
    ...baseConfig,
    store: new RedisStore({
      sendCommand: (...args: string[]) => client.sendCommand(args),
      prefix: redis.prefix ?? 'rl:',
    }),
  });
}

/**
 * Apply all security middleware to an Express application
 */
export async function applySecurity(
  app: Application,
  rateLimiterOptions?: RateLimiterOptions
): Promise<void> {
  // Apply Helmet security headers
  app.use(helmet(helmetConfig));

  // Apply CORS
  app.use(cors(corsConfig));

  // Apply rate limiting
  const limiter = await createRateLimiter(rateLimiterOptions);
  app.use(limiter);

  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // Parse JSON payloads with size limit
  app.use(express.json({ limit: '1mb' }));

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
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