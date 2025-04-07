import { Types } from 'mongoose';
import { Tenant } from '../models';
import { AppError } from '../utils/errors';

/**
 * Utility to enforce single tenant ownership rule
 */
export const enforceSingleTenantOwnership = async (userId: Types.ObjectId): Promise<void> => {
  const existingTenant = await Tenant.findOne({
    owner: userId,
    status: { $ne: 'archived' }
  });

  if (existingTenant) {
    throw new AppError(
      'You already own an active tenant. A user can only own one tenant at a time.',
      400
    );
  }
};