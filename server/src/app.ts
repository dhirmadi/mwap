import 'dotenv/config';
import express from 'express';
import type { RequestHandler } from 'express';
import compression from 'compression';
import path from 'path';
import { setupSecurity } from '@core/middleware/security';
import { errorHandler, notFoundHandler } from '@core/middleware/error';
import { requestLogger } from '@core/middleware/request-logger';
import { router as apiRoutes } from './routes';
import { logger } from '@core/utils/logger';

const app = express();

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(requestLogger);
setupSecurity(app);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1', apiRoutes);

// Static files configuration
const clientPath = path.resolve(__dirname, '../../client/dist');
const indexPath = path.join(clientPath, 'index.html');

// Validate client build at startup
const fs = require('fs');
const exists = fs.existsSync(indexPath);
const stats = exists ? fs.statSync(indexPath) : null;

// Enhanced logging for client app configuration
logger.debug('Client app configuration', {
  clientPath,
  indexPath,
  exists,
  size: stats?.size,
  lastModified: stats?.mtime
});

// Serve static files with proper caching
app.use(express.static(clientPath, {
  etag: true,
  lastModified: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  index: false // Disable auto-serving of index.html
}));

// Serve client app for all non-API routes
const serveClientApp: RequestHandler = (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  
  // Ensure client app is built
  if (!exists) {
    const error = 'Client app not built. Run: npm run build';
    logger.error(error, { clientPath });
    res.status(500).json({ error });
    return;
  }

  // Log client-side route access
  logger.debug('Serving client app for route', {
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent')
  });
  
  // Serve index.html for client-side routing
  res.sendFile('index.html', {
    root: clientPath,
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now().toString(),
      'x-sent': true,
      'cache-control': process.env.NODE_ENV === 'production' 
        ? 'public, max-age=0, must-revalidate' 
        : 'no-cache, no-store, must-revalidate'
    }
  }, (err) => {
    if (err) {
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