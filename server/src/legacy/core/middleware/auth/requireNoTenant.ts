/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { TenantService } from '@features/tenant/services';

export const requireNoTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.id) {
    return next(new AppError('User not authenticated', 401));
  }

  const tenantService = new TenantService();
  const existingTenant = await tenantService.getTenantByOwnerId(req.user.id);

  if (existingTenant) {
    return next(new AppError('User already owns a tenant', 409));
  }

  next();
};