/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@core/utils/logger';

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { method, originalUrl, ip } = req;
  
  logger.info('Incoming request', {
    method,
    path: originalUrl,
    ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  next();
};