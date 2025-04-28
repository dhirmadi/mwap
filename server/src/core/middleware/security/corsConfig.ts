// server/src/core/middleware/security/corsConfig.ts
import cors from 'cors';
import { CorsOptions } from 'cors';
import { env } from '@core/config/environment'; // use centralized config
import { logger } from '@core/utils/logger';

const parseAllowedOrigins = (origins: string): string[] => {
  return origins.split(',').map(origin => origin.trim());
};

const ALLOWED_ORIGINS = parseAllowedOrigins(env.allowedOrigins);

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true); // Allow server-to-server (no origin)
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    } else {
      logger.warn('Blocked by CORS', { origin });
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Tenant-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400,
};

export const configureCors = () => cors(corsConfig);
