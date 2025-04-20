import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
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

// Static files
const clientPath = path.join(__dirname, '../../client/dist');
logger.debug('Client path configuration', {
  dirname: __dirname,
  clientPath,
  exists: require('fs').existsSync(clientPath)
});
app.use(express.static(clientPath));
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientPath, 'index.html');
  if (!require('fs').existsSync(indexPath)) {
    logger.error('Client index.html not found', {
      indexPath,
      clientPath,
      dirname: __dirname
    });
    return res.status(500).json({ error: 'Frontend not built. Please run npm run build in the client directory.' });
  }
  res.sendFile(indexPath);
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };