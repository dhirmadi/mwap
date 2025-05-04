/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import rateLimit from 'express-rate-limit';
import { env } from '@core/config/environment';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
