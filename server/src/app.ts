import 'dotenv/config';
import express from 'express';
import type { RequestHandler } from 'express';
import compression from 'compression';
import path from 'path';
import { helmetConfig } from '@core/middleware/security/helmetConfig';
import { configureCors, corsConfig } from '@core/middleware/security';
import { rateLimiter } from '@core/middleware/security/rateLimiter';
import { errorHandler } from '@core/middleware/errors';
import { notFoundHandler } from '@core/middleware/errors';
import { requestLogger } from '@core/middleware/security/requestLogger';
import { router as apiRoutes } from './routes';
import { logger } from '@core/utils/logger';

const app = express();

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(requestLogger);
app.use(helmetConfig);
app.use(rateLimiter);
app.use(configureCors());


// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
if (process.env.DISABLE_API_V1 !== 'true') {
  app.use('/api/v1', apiRoutes);
  logger.info('API v1 routes enabled');
} else {
  logger.warn('API v1 routes disabled by environment flag');
  app.use('/api/v1', (_req, res) => {
    res.status(410).json({
      error: 'API v1 is deprecated and disabled. Please use API v2 endpoints.',
      docs: '/api/v2/docs'
    });
  });
}

/**
 * Static File Serving Configuration
 * 
 * This section handles serving the client-side application and its static assets.
 * The implementation uses a two-tier approach:
 * 1. Static file middleware for assets (js, css, images)
 * 2. Custom middleware for client-side routing (SPA)
 */

// Use absolute path resolution to prevent path traversal issues
const clientPath = path.resolve(__dirname, '../../client/dist');
const indexPath = path.join(clientPath, 'index.html');

/**
 * Startup Validation
 * 
 * Verify the client build exists and gather stats for monitoring.
 * This early check prevents runtime errors and provides useful debugging info.
 */
const fs = require('fs');
const exists = fs.existsSync(indexPath);
const stats = exists ? fs.statSync(indexPath) : null;

// Log detailed configuration for debugging and monitoring
logger.debug('Client app configuration', {
  clientPath,
  indexPath,
  exists,
  size: stats?.size,
  lastModified: stats?.mtime
});

/**
 * Static Asset Serving
 * 
 * Configuration details:
 * - etag: Enable strong caching with ETags
 * - lastModified: Use Last-Modified headers for caching
 * - maxAge: 
 *   - Production: 1 day cache (86400 seconds)
 *   - Development: No cache (0 seconds)
 * - index: Disabled to prevent conflicts with SPA routing
 */
app.use(express.static(clientPath, {
  etag: true,
  lastModified: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  index: false // Let our custom middleware handle index.html
}));

/**
 * Single Page Application Handler
 * 
 * This middleware serves the client application for all non-API routes,
 * enabling client-side routing while maintaining proper caching behavior.
 * 
 * Caching Strategy:
 * - Production: public cache with immediate revalidation
 * - Development: no caching to aid debugging
 * 
 * Security:
 * - Denies access to dotfiles
 * - Uses root path to prevent directory traversal
 * - Validates client build before serving
 */
const serveClientApp: RequestHandler = (req, res, next) => {
  // Skip API routes to maintain separation of concerns
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  
  // Early validation of client build
  if (!exists) {
    const error = 'Client app not built. Run: npm run build';
    logger.error(error, { clientPath });
    res.status(500).json({ error });
    return;
  }

  // Enhanced logging for monitoring and debugging
  logger.debug('Serving client app for route', {
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent')
  });
  
  // Serve index.html with environment-specific caching
  res.sendFile('index.html', {
    root: clientPath, // Use root option for security
    dotfiles: 'deny', // Prevent access to hidden files
    headers: {
      'x-timestamp': Date.now().toString(),
      'x-sent': true,
      'cache-control': process.env.NODE_ENV === 'production' 
        ? 'public, max-age=0, must-revalidate' // Always revalidate in production
        : 'no-cache, no-store, must-revalidate' // No cache in development
    }
  }, (err) => {
    if (err) {
      // Detailed error logging for troubleshooting
      logger.error('Failed to serve client app', {
        error: err.message,
        path: req.path,
        indexPath,
        ...(err as NodeJS.ErrnoException).code ? { code: (err as NodeJS.ErrnoException).code } : {}
      });
      next(err);
    }
  });
};

app.get('*', serveClientApp);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };