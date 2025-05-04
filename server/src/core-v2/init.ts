import type { Express, Request, Response, NextFunction } from 'express';
import express from 'express';

import { applySecurity } from '../middleware-v2/security';
import { extractUser } from '../middleware-v2/auth/extractUser';
import { AppError } from './errors';
import { globalErrorHandler } from './errors/globalErrorHandler';
import { logger } from '../logging-v2';
import { requestLogger } from '../logging-v2';

/**
 * Handle 404 Not Found errors
 */
function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.path}`));
}

/**
 * Initialize core v2 middleware and error handling
 * 
 * @param app Express application instance
 * @returns Updated Express application with v2 middleware
 * 
 * @example
 * ```ts
 * const app = express();
 * 
 * // Initialize v2 core
 * await initCoreV2(app);
 * 
 * // Add v2 routes AFTER core initialization
 * app.use('/api/v2/projects', projectRoutes);
 * app.use('/api/v2/tenants', tenantRoutes);
 * ```
 */
export async function initCoreV2(app: Express): Promise<Express> {
  try {
    // Security middleware stack (includes express.json)
    await applySecurity(app);

    // Request logging middleware
    app.use(requestLogger());

    // Auth middleware
    app.use(extractUser);

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
 * Apply error handling middleware
 * Must be called AFTER all routes are registered
 */
export function applyErrorHandling(app: Express): Express {
  // Handle 404s
  app.use(notFoundHandler);

  // Global error handler
  app.use(globalErrorHandler);

  return app;
}

/**
 * Example usage in app.ts:
 *
 * import express from 'express';
 * import { initCoreV2, applyErrorHandling } from './core-v2/init';
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
 *   // Apply error handling AFTER routes
 *   applyErrorHandling(app);
 *   
 *   return app;
 * }
 */