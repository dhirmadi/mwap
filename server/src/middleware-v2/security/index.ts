import type { Request, RequestHandler } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { AppError } from '../../core-v2/errors';

/**
 * CORS middleware configuration
 */
export const corsMiddleware = cors({
  origin: [
    'http://localhost:5173',
    /\.herokuapp\.com$/
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  maxAge: 86400, // 24 hours
});

/**
 * Rate limiter options for Redis store
 */
export interface RedisOptions {
  url: string;
  prefix?: string;
}

/**
 * Creates a rate limiter middleware
 * 
 * @param redis Optional Redis configuration for distributed rate limiting
 * @returns Express middleware for rate limiting
 */
export async function createRateLimiter(redis?: RedisOptions): Promise<RequestHandler> {
  const config = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new AppError('Too many requests', 'RATE_LIMIT_EXCEEDED', 429));
    },
  };

  // Use memory store if no Redis config
  if (!redis) {
    return rateLimit(config);
  }

  try {
    const client = createClient({ url: redis.url });
    await client.connect();

    return rateLimit({
      ...config,
      store: new RedisStore({
        sendCommand: (...args: string[]) => client.sendCommand(args),
        prefix: redis.prefix ?? 'rl:',
      }),
    });
  } catch (error) {
    // Fallback to memory store on Redis error
    return rateLimit(config);
  }
}

// Example usage:
/*
import express from 'express';
import { corsMiddleware, createRateLimiter } from '../middleware-v2/security';

const app = express();

// Apply CORS and rate limiting to /api/v2 routes
app.use('/api/v2', corsMiddleware);

// Create rate limiter with optional Redis store
const rateLimiter = await createRateLimiter({
  url: process.env.REDIS_URL,
  prefix: 'api:v2:rl:',
});
app.use('/api/v2', rateLimiter);
*/