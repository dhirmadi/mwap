import { Types } from 'mongoose';
import { TenantModel, TenantDocument } from '../schemas';
import { CreateTenantInput, UpdateTenantInput } from '../types';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError, 
  InternalServerError 
} from '@core/errors';
import { logger } from '@core/utils';

export class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(userId: string, input: CreateTenantInput) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID');
      }

      // Check if user already has a tenant
      const existingTenant = await TenantModel.findOne({ 
        ownerId: new Types.ObjectId(userId),
        archived: false
      });

      if (existingTenant) {
        throw new ConflictError('User already has an active tenant');
      }

      // Create new tenant
      const tenant = new TenantModel({
        ...input,
        ownerId: new Types.ObjectId(userId),
        members: [{ userId, role: 'owner' }]
      });

      await tenant.save();
      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to create tenant', metadata);
      throw new InternalServerError('Failed to create tenant', metadata);
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOne({
        _id: new Types.ObjectId(tenantId),
        archived: false
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to get tenant', metadata);
      throw new InternalServerError('Failed to get tenant', metadata);
    }
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, input: UpdateTenantInput) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(tenantId),
          archived: false
        },
        { $set: input },
        { new: true, runValidators: true }
      );

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to update tenant', metadata);
      throw new InternalServerError('Failed to update tenant', metadata);
    }
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(tenantId),
          archived: false
        },
        { $set: { archived: true } },
        { new: true }
      );

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to delete tenant', metadata);
      throw new InternalServerError('Failed to delete tenant', metadata);
    }
  }

  /**
   * Add member to tenant
   */
  async addMember(tenantId: string, userId: string, role: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOne({
        _id: new Types.ObjectId(tenantId),
        archived: false
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // Check if user is already a member
      if (tenant.members.some(member => member.userId === userId)) {
        throw new ConflictError('User is already a member of this tenant');
      }

      // Validate role
      if (!['owner', 'admin', 'member'].includes(role)) {
        throw new ValidationError('Invalid role. Must be one of: owner, admin, member');
      }

      tenant.members.push({ userId, role });
      await tenant.save();

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to add member to tenant', metadata);
      throw new InternalServerError('Failed to add member to tenant', metadata);
    }
  }

  /**
   * Remove member from tenant
   */
  async removeMember(tenantId: string, userId: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOne({
        _id: new Types.ObjectId(tenantId),
        archived: false
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // Check if user is a member
      const memberIndex = tenant.members.findIndex(member => member.userId === userId);
      if (memberIndex === -1) {
        throw new NotFoundError('User is not a member of this tenant');
      }

      // Don't allow removing the owner
      if (tenant.members[memberIndex].role === 'owner') {
        throw new ValidationError('Cannot remove tenant owner');
      }

      tenant.members.splice(memberIndex, 1);
      await tenant.save();

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to remove member from tenant', metadata);
      throw new InternalServerError('Failed to remove member from tenant', metadata);
    }
  }

  /**
   * Get tenant by owner ID
   */
  async getTenantByOwnerId(ownerId: string): Promise<TenantDocument | null> {
    try {
      if (!Types.ObjectId.isValid(ownerId)) {
        throw new ValidationError('Invalid owner ID');
      }

      const tenant = await TenantModel.findOne({
        ownerId: new Types.ObjectId(ownerId),
        archived: false
      });

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to get tenant by owner ID', metadata);
      throw new InternalServerError('Failed to get tenant by owner ID', metadata);
    }
  }
}