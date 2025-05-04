/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { TenantService } from '@features/tenant/services/index';

export const verifyTenantMember = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const { tenantId } = req.params;
  
  if (!req.user?.id) {
    return next(new AppError('User not authenticated', 401));
  }

  const tenantService = new TenantService();
  const tenant = await tenantService.getTenantById(tenantId);

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const isMember = tenant.members.some(m => m.userId === req.user?.id);
  
  if (!isMember) {
    return next(new AppError('Not tenant member', 403));
  }

  req.tenant = tenant;
  next();
};