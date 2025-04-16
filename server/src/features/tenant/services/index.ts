import { Types } from 'mongoose';
import { TenantModel, TenantDocument } from '../schemas';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError 
} from '@core/errors';
import { generateRequestId } from '@core/utils';

/**
 * Get tenant by owner ID
 */
export async function getTenantByOwnerId(
  ownerId: string | Types.ObjectId
): Promise<TenantDocument | null> {
  try {
    // Convert string ID to ObjectId if needed
    const ownerObjectId = typeof ownerId === 'string' 
      ? new Types.ObjectId(ownerId)
      : ownerId;

    // Find active tenant for owner
    return await TenantModel.findOne({
      ownerId: ownerObjectId,
      archived: false
    });
  } catch (error) {
    throw new NotFoundError(
      'Failed to find tenant',
      { ownerId, error }
    );
  }
}

/**
 * Create new tenant
 */
export async function createTenant(
  ownerId: string | Types.ObjectId,
  name: string
): Promise<TenantDocument> {
  try {
    // Convert string ID to ObjectId if needed
    const ownerObjectId = typeof ownerId === 'string'
      ? new Types.ObjectId(ownerId)
      : ownerId;

    // Check if owner already has an active tenant
    const existingTenant = await TenantModel.findOne({
      ownerId: ownerObjectId,
      archived: false
    });

    if (existingTenant) {
      throw new ConflictError(
        'User already has an active tenant',
        { ownerId, tenantId: existingTenant._id }
      );
    }

    // Validate tenant name
    if (!name || name.trim().length < 3) {
      throw new ValidationError(
        'Tenant name must be at least 3 characters',
        { name }
      );
    }

    // Create new tenant
    const tenant = new TenantModel({
      ownerId: ownerObjectId,
      name: name.trim(),
      createdAt: new Date(),
      archived: false
    });

    // Save to database
    await tenant.save();

    return tenant;
  } catch (error) {
    // Re-throw known errors
    if (
      error instanceof ValidationError ||
      error instanceof ConflictError
    ) {
      throw error;
    }

    // Handle database errors
    if (error.code === 11000) {
      throw new ConflictError(
        'Tenant name already exists',
        { name, error }
      );
    }

    // Handle other errors
    throw new Error(
      'Failed to create tenant',
      { cause: { ownerId, name, error } }
    );
  }
}

/**
 * Update tenant
 */
export async function updateTenant(
  tenantId: string | Types.ObjectId,
  ownerId: string | Types.ObjectId,
  updates: {
    name?: string;
    archived?: boolean;
  }
): Promise<TenantDocument> {
  try {
    // Convert IDs to ObjectId if needed
    const tenantObjectId = typeof tenantId === 'string'
      ? new Types.ObjectId(tenantId)
      : tenantId;
    const ownerObjectId = typeof ownerId === 'string'
      ? new Types.ObjectId(ownerId)
      : ownerId;

    // Find and update tenant
    const tenant = await TenantModel.findOneAndUpdate(
      {
        _id: tenantObjectId,
        ownerId: ownerObjectId,
        archived: false
      },
      {
        $set: {
          ...(updates.name && { name: updates.name.trim() }),
          ...(typeof updates.archived === 'boolean' && { archived: updates.archived }),
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!tenant) {
      throw new NotFoundError(
        'Tenant not found or not owned by user',
        { tenantId, ownerId }
      );
    }

    return tenant;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Handle database errors
    if (error.code === 11000) {
      throw new ConflictError(
        'Tenant name already exists',
        { tenantId, updates, error }
      );
    }

    // Handle other errors
    throw new Error(
      'Failed to update tenant',
      { cause: { tenantId, ownerId, updates, error } }
    );
  }
}

/**
 * Archive tenant
 */
export async function archiveTenant(
  tenantId: string | Types.ObjectId,
  ownerId: string | Types.ObjectId
): Promise<TenantDocument> {
  return updateTenant(tenantId, ownerId, { archived: true });
}