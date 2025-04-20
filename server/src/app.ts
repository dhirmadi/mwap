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

// Static files - check client build at startup
const clientPath = path.join(__dirname, '../../client/dist');
const indexPath = path.join(clientPath, 'index.html');
const exists = require('fs').existsSync(indexPath);

logger.debug('Client app configuration', { clientPath, exists });

// Serve static files
app.use(express.static(clientPath));

// Serve client app for all non-API routes
const serveClientApp: RequestHandler = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  
  if (!exists) {
    logger.error('Client app not built', { clientPath });
    res.status(500).json({ error: 'Client app not built. Run: npm run build' });
    return;
  }
  
  // Always serve index.html for client-side routing
  res.sendFile(indexPath, {
    root: clientPath,
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now().toString(),
      'x-sent': true
    }
  }, (err) => {
    if (err) {
      logger.error('Failed to serve client app', { error: err.message });
      next(err);
    }
  });
};

app.get('*', serveClientApp);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };