import rateLimit from 'express-rate-limit';
import { config } from '../../../config';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.security.rateLimit.maxRequests || 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});