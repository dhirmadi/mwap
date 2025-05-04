/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';
import { TenantService } from '@features/tenant/services';
import { getUserIdentifier } from '@core/utils/user-mapping';
import { logger } from '@core/utils/logger';

const verifyTenantOwnership = async (tenantId: string, userId: string, tenantService: TenantService) => {
  const tenant = await tenantService.getTenantById(tenantId);

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

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
    throw new AppError('Not tenant owner', 403);
  }

  return tenant;
};

export const verifyTenantOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.params.id || req.body.tenantId;
    
    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const tenantService = new TenantService();
    const userId = getUserIdentifier(req.user, 'auth');

    const tenant = await verifyTenantOwnership(tenantId, userId, tenantService);
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