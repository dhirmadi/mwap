import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User, Tenant } from '../models';
import { AppError } from '../utils/errors';
import { TenantRequest } from './types';

/**
 * Middleware to inject tenant context into the request
 */
export const injectTenantContext = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const auth0Id = req.user.auth0Id;

    // Validate tenant ID format
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new AppError('Invalid tenant ID format', 400);
    }

    // Find tenant
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // Find user and check membership
    const user = await User.findOne({ auth0Id });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const membership = user.tenants.find(t => t.tenantId.equals(tenant._id));
    if (!membership) {
      throw new AppError('You do not have access to this tenant', 403);
    }

    // Inject tenant context
    req.tenant = tenant;
    req.userTenantRole = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};