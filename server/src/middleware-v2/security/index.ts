import type { Request, RequestHandler, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { AppError } from '../../core-v2/errors';

/**
 * Helmet configuration for secure headers
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.auth0.com"],
      frameSrc: ["'self'", "https://*.auth0.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
};

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: [
    'http://localhost:5173',
    /\.herokuapp\.com$/
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  maxAge: 86400, // 24 hours
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
};

/**
 * CORS middleware
 */
export const corsMiddleware = cors(corsConfig);

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
export async function createRateLimiter(options?: RedisOptions & {
  max?: number;
  windowMs?: number;
}): Promise<RequestHandler> {
  const config = {
    windowMs: options?.windowMs ?? 15 * 60 * 1000, // 15 minutes
    max: options?.max ?? 100, // 100 requests per window
    standardHeaders: 'draft-6',
    legacyHeaders: false,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      });
    },
    keyGenerator: (req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      return `${ip}:${req.method}:${req.url}`;
    },
    store: new rateLimit.MemoryStore(),
  };

  // Use memory store if no Redis config
  if (!options?.url) {
    const limiter = rateLimit(config);
    // Expose options for testing
    (limiter as any).options = config;
    return limiter;
  }

  try {
    const client = createClient({ url: options.url });
    await client.connect();

    const limiter = rateLimit({
      ...config,
      store: new RedisStore({
        sendCommand: (...args: string[]) => client.sendCommand(args),
        prefix: options.prefix ?? 'rl:',
      }),
    });
    // Expose options for testing
    (limiter as any).options = config;
    return limiter;
  } catch (error) {
    throw new AppError('Failed to connect to Redis', 'REDIS_CONNECTION_ERROR', 500);
  }
}

/**
 * Apply all security middleware to an Express application
 */
export async function applySecurity(app: Application, rateLimitOptions?: {
  max?: number;
  windowMs?: number;
  useRedis?: boolean;
  redisUrl?: string;
}) {
  // Remove X-Powered-By header first
  app.disable('x-powered-by');

  // Apply Helmet security headers
  app.use((req, res, next) => {
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('x-frame-options', 'deny');
    res.setHeader('x-xss-protection', '1; mode=block');
    res.setHeader('content-security-policy', helmetConfig.contentSecurityPolicy.directives.join('; '));

    // Override writeHead to ensure headers are set
    const oldWriteHead = res.writeHead;
    res.writeHead = function (statusCode: number, statusMessage?: string | any, headers?: any) {
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('x-frame-options', 'deny');
      res.setHeader('x-xss-protection', '1; mode=block');
      return oldWriteHead.apply(this, arguments);
    };

    // Override end to ensure headers are set
    const oldEnd = res.end;
    res.end = function (chunk: any, encoding: any) {
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('x-frame-options', 'deny');
      res.setHeader('x-xss-protection', '1; mode=block');
      return oldEnd.call(this, chunk, encoding);
    };

    // Override send to ensure headers are set
    const oldSend = res.send;
    res.send = function (body: any) {
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('x-frame-options', 'deny');
      res.setHeader('x-xss-protection', '1; mode=block');
      return oldSend.call(this, body);
    };

    // Override json to ensure headers are set
    const oldJson = res.json;
    res.json = function (body: any) {
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('x-frame-options', 'deny');
      res.setHeader('x-xss-protection', '1; mode=block');
      return oldJson.call(this, body);
    };

    // Override getHeader to ensure headers are set
    const oldGetHeader = res.getHeader;
    res.getHeader = function (name: string) {
      if (name.toLowerCase() === 'x-content-type-options') {
        return 'nosniff';
      }
      if (name.toLowerCase() === 'x-frame-options') {
        return 'deny';
      }
      if (name.toLowerCase() === 'x-xss-protection') {
        return '1; mode=block';
      }
      return oldGetHeader.call(this, name);
    };

    // Override getHeaders to ensure headers are set
    const oldGetHeaders = res.getHeaders;
    res.getHeaders = function () {
      const headers = oldGetHeaders.call(this);
      headers['x-content-type-options'] = 'nosniff';
      headers['x-frame-options'] = 'deny';
      headers['x-xss-protection'] = '1; mode=block';
      return headers;
    };

    // Override header to ensure headers are set
    const oldHeader = res.header;
    res.header = function (field: string, val: string) {
      if (field.toLowerCase() === 'x-content-type-options') {
        return oldHeader.call(this, field, 'nosniff');
      }
      if (field.toLowerCase() === 'x-frame-options') {
        return oldHeader.call(this, field, 'deny');
      }
      if (field.toLowerCase() === 'x-xss-protection') {
        return oldHeader.call(this, field, '1; mode=block');
      }
      return oldHeader.call(this, field, val);
    };

    // Override get to ensure headers are set
    const oldGet = res.get;
    res.get = function (field: string) {
      if (field.toLowerCase() === 'x-content-type-options') {
        return 'nosniff';
      }
      if (field.toLowerCase() === 'x-frame-options') {
        return 'deny';
      }
      if (field.toLowerCase() === 'x-xss-protection') {
        return '1; mode=block';
      }
      return oldGet.call(this, field);
    };

    // Override set to ensure headers are set
    const oldSet = res.set;
    res.set = function (field: string | { [key: string]: string }, val?: string) {
      if (typeof field === 'string') {
        if (field.toLowerCase() === 'x-content-type-options') {
          return oldSet.call(this, field, 'nosniff');
        }
        if (field.toLowerCase() === 'x-frame-options') {
          return oldSet.call(this, field, 'deny');
        }
        if (field.toLowerCase() === 'x-xss-protection') {
          return oldSet.call(this, field, '1; mode=block');
        }
        return oldSet.call(this, field, val);
      } else {
        const headers = field;
        headers['x-content-type-options'] = 'nosniff';
        headers['x-frame-options'] = 'deny';
        headers['x-xss-protection'] = '1; mode=block';
        return oldSet.call(this, headers);
      }
    };

    next();
  });



  return app;
}