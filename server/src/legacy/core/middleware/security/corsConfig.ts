/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

// server/src/core/middleware/security/corsConfig.ts
import cors from 'cors';
import { CorsOptions } from 'cors';
import { env } from '@core/config/environment';
import { logger } from '@core/utils/logger';

const parseAllowedOrigins = (origins: string): string[] => {
  return origins.split(',').map(origin => origin.trim());
};

const ALLOWED_ORIGINS = parseAllowedOrigins(env.allowedOrigins);

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }

    // Always allow localhost in development
    if (env.nodeEnv === 'development' && (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('https://localhost:')
    )) {
      return callback(null, true);
    }

    // Check against configured allowed origins
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Log and reject other origins
    logger.warn('Blocked by CORS', { 
      origin,
      allowedOrigins: ALLOWED_ORIGINS,
      nodeEnv: env.nodeEnv
    });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Tenant-ID',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Tenant-ID'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export const configureCors = () => cors(corsConfig);
