import { Router } from 'express';
import { router as apiRoutes } from './index';

const v1Router = Router();

// Mount all API routes under /v1
v1Router.use('/v1', apiRoutes);

// Redirect root to latest version
v1Router.get('/', (req, res) => {
  res.redirect('/v1');
});

export { v1Router };