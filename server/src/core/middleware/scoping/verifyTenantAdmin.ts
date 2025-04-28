import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { TenantService } from '../../../features/tenant/services/tenant.service';
import { TenantRole } from '../../../features/tenant/types';

export const verifyTenantAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const { tenantId } = req.params;
  
  if (!req.user?.id) {
    return next(new AppError(ErrorCode.UNAUTHORIZED, 'User not authenticated'));
  }

  const tenantService = new TenantService();
  const tenant = await tenantService.findById(tenantId);

  if (!tenant) {
    return next(new AppError(ErrorCode.NOT_FOUND, 'Tenant not found'));
  }

  const member = tenant.members.find(m => m.userId === req.user?.id);
  
  if (!member || member.role !== TenantRole.ADMIN) {
    return next(new AppError(ErrorCode.FORBIDDEN, 'Not tenant admin'));
  }

  req.tenant = tenant;
  next();
};