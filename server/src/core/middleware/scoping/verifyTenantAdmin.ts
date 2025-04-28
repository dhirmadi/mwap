import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { TenantService } from '@features/tenant/services/index';
import { TenantRole } from '@features/tenant/schemas';

export const verifyTenantAdmin = async (
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

  const member = tenant.members.find(m => m.userId === req.user?.id);
  
  if (!member || member.role !== TenantRole.ADMIN) {
    return next(new AppError('Not tenant admin', 403));
  }

  req.tenant = tenant;
  next();
};