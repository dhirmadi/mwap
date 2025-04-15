import { Router } from 'express';
import { healthRouter } from './health';

/**
 * Core routes router
 * - Health check
 * - (Future) Metrics
 * - (Future) Status
 */
export const coreRouter = Router();

// Mount health check route
coreRouter.use(healthRouter);