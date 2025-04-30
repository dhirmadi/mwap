import type { Express } from 'express';
import express from 'express';

import { applySecurity } from '../middleware-v2/security';
import { extractUser } from '../middleware-v2/auth/extractUser';
import { globalErrorHandler } from './errors';
import { logger } from '../logging-v2';

/**
 * Initialize core v2 middleware and error handling
 * 
 * @param app Express application instance
 * @returns Updated Express application with v2 middleware
 */
export async function initCoreV2(app: Express): Promise<Express> {
  try {
    // Basic middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Security middleware stack
    await applySecurity(app);

    // Auth middleware
    app.use(extractUser);

    // Global error handler
    app.use(globalErrorHandler);

    // Log successful initialization
    logger.info('Core v2 initialized', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });

    return app;
  } catch (error) {
    // Log initialization failure
    logger.error('Core v2 initialization failed', { error });
    throw error;
  }
}

/**
 * Example usage in app.ts:
 *
 * import express from 'express';
 * import { initCoreV2 } from './core-v2/init';
 * 
 * async function bootstrap() {
 *   const app = express();
 *   
 *   // Initialize v2 core
 *   await initCoreV2(app);
 *   
 *   // Add v2 routes
 *   app.use('/api/v2/projects', projectRoutes);
 *   app.use('/api/v2/tenants', tenantRoutes);
 *   
 *   return app;
 * }
 */