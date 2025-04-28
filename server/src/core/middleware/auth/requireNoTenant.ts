import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../../errors';
import { TenantService } from '../../../features/tenant/services/tenant.service';

export const requireNoTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.id) {
    return next(new AppError(ErrorCode.UNAUTHORIZED, 'User not authenticated'));
  }

  const tenantService = new TenantService();
  const existingTenant = await tenantService.findByOwnerId(req.user.id);

  if (existingTenant) {
    return next(new AppError(
      ErrorCode.CONFLICT,
      'User already owns a tenant'
    ));
  }

  next();
};