import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { TenantService } from '../../../features/tenant/services/tenant.service';

export const verifyTenantOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const { tenantId } = req.params;
  
  if (!req.user?.id) {
    return next(new AppError('User not authenticated', 401));
  }

  const tenantService = new TenantService();
  const tenant = await tenantService.findById(tenantId);

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  if (tenant.ownerId !== req.user.id) {
    return next(new AppError('Not tenant owner', 403));
  }

  req.tenant = tenant;
  next();
};