import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../../errors';
import { TenantService } from '../../../features/tenant/services/tenant.service';

export const verifyTenantOwner = async (
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

  if (tenant.ownerId !== req.user.id) {
    return next(new AppError(ErrorCode.FORBIDDEN, 'Not tenant owner'));
  }

  req.tenant = tenant;
  next();
};