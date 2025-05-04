import 'dotenv/config';
import express from 'express';
import type { RequestHandler } from 'express';
import compression from 'compression';
import path from 'path';
import { promises as fs } from 'fs';

// Core v2 imports
import { initCoreV2 } from '@core-v2/init';
import { globalErrorHandler } from '@core-v2/errors/globalErrorHandler';
import { notFoundHandler } from '@core-v2/errors/notFoundHandler';
import { logger } from '@core-v2/logging';

// Security middleware
import { configureHelmet } from '@core-v2/security/helmet';
import { configureCors } from '@core-v2/security/cors';
import { configureRateLimiter } from '@core-v2/security/rateLimiter';
import { requestLogger } from '@core-v2/security/requestLogger';

// Routes
import { router as v1Routes } from './routes/v1';
import { router as v2Routes } from './routes/v2';

const app = express();

// Initialize core v2 components
initCoreV2(app);

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security middleware
app.use(requestLogger);
app.use(configureHelmet());
app.use(configureRateLimiter());
app.use(configureCors());

// Health check endpoint with enhanced monitoring
app.get('/health', (_req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    version: process.env.npm_package_version || '2.0.0'
  });
});

// API Routes
// Mount v2 API first as it's the primary version
app.use('/api/v2', v2Routes);
logger.info('API v2 routes enabled');

// Handle v1 API based on configuration
if (process.env.DISABLE_API_V1 === 'true') {
  logger.warn('API v1 routes disabled by environment flag');
  app.use('/api/v1', (_req, res) => {
    res.status(410).json({
      error: 'API v1 is deprecated and disabled. Please use API v2 endpoints.',
      docs: '/api/v2/docs'
    });
  });
} else {
  app.use('/api/v1', v1Routes);
  logger.info('API v1 routes enabled (deprecated)');
}

/**
 * Static File Serving Configuration
 * Handles serving the client-side application and its static assets with
 * enhanced security and caching controls.
 */

// Use absolute path resolution to prevent path traversal issues
const clientPath = path.resolve(__dirname, '../../client/dist');
const indexPath = path.join(clientPath, 'index.html');

// Validate client build and gather stats

async function validateClientBuild() {
  try {
    const stats = await fs.stat(indexPath);
    logger.debug('Client app configuration', {
      clientPath,
      indexPath,
      size: stats.size,
      lastModified: stats.mtime
    });
    return true;
  } catch (error) {
    logger.warn('Client app not found', {
      error: (error as NodeJS.ErrnoException).message,
      clientPath,
      indexPath
    });
    return false;
  }
}

// Initialize client validation
const clientBuildPromise = validateClientBuild();

// Configure static asset serving
const staticOptions = {
  etag: true,
  lastModified: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  index: false,
  dotfiles: 'ignore',
  // Add security headers
  setHeaders: (res: express.Response) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
  }
};

app.use(express.static(clientPath, staticOptions));

// SPA request handler with async build validation
const serveClientApp: RequestHandler = async (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Validate client build
  const exists = await clientBuildPromise;
  if (!exists) {
    return res.status(500).json({
      error: 'Client app not built',
      message: 'Run: npm run build'
    });
  }

  // Log request for monitoring
  logger.debug('Serving client app', {
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent')
  });

  // Serve index.html with proper caching
  res.sendFile('index.html', {
    root: clientPath,
    dotfiles: 'deny',
    headers: {
      'Cache-Control': process.env.NODE_ENV === 'production'
        ? 'public, max-age=0, must-revalidate'
        : 'no-cache, no-store, must-revalidate',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  }, (err) => {
    if (err) {
      logger.error('Failed to serve client app', {
        error: err.message,
        code: (err as NodeJS.ErrnoException).code,
        path: req.path
      });
      next(err);
    }
  });
};

// Mount SPA handler
app.get('*', serveClientApp);

// Error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app };