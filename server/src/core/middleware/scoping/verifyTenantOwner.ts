import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';
import { TenantService } from '@features/tenant/services';
import { getUserIdentifier } from '@core/utils/user-mapping';
import { logger } from '@core/utils/logger';

export const verifyTenantOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: tenantId } = req.params;
    
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const tenantService = new TenantService();
    const tenant = await tenantService.getTenantById(tenantId);

    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    const userId = getUserIdentifier(req.user, 'auth');

    // Check both ownerId and members array for owner role
    const isOwner = tenant.ownerId === userId || 
      tenant.members.some(member => 
        member.userId === userId && 
        member.role === 'OWNER'
      );

    if (!isOwner) {
      logger.warn('Unauthorized tenant access attempt', {
        userId,
        tenantId,
        ownerId: tenant.ownerId,
        memberRoles: tenant.members.map(m => ({ userId: m.userId, role: m.role }))
      });
      return next(new AppError('Not tenant owner', 403));
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    logger.error('Error in verifyTenantOwner middleware', {
      error: error instanceof Error ? error.message : error,
      tenantId: req.params.id,
      userId: req.user?.id
    });
    next(error);
  }
};