import { Router } from 'express';
import { router as apiRoutes } from './index';
import { logger } from '@core-v2/logging';

const v1Router = Router();

// Log all v1 requests
v1Router.use((req, res, next) => {
  logger.debug('V1 route accessed', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'present' : 'missing'
    }
  });
  next();
});

// Mount all API routes under /v1
v1Router.use('/v1', apiRoutes);

// Redirect root to latest version
v1Router.get('/', (req, res) => {
  res.redirect('/v1');
});

export { v1Router };