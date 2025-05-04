/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

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