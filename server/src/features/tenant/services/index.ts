import { Types } from 'mongoose';
import { TenantModel } from '../schemas';
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
      // Check if user already has a tenant
      const existingTenant = await TenantModel.findOne({ ownerId: userId });
      if (existingTenant) {
        throw new ConflictError('User already has a tenant');
      }

      // Create new tenant
      const tenant = new TenantModel({
        ...input,
        ownerId: userId,
        members: [{ userId, role: 'owner' }]
      });

      await tenant.save();
      return tenant;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error('Failed to create tenant', error);
      throw new InternalServerError('Failed to create tenant');
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

      const tenant = await TenantModel.findById(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to get tenant', error);
      throw new InternalServerError('Failed to get tenant');
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

      const tenant = await TenantModel.findByIdAndUpdate(
        tenantId,
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
      logger.error('Failed to update tenant', error);
      throw new InternalServerError('Failed to update tenant');
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

      const tenant = await TenantModel.findByIdAndDelete(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to delete tenant', error);
      throw new InternalServerError('Failed to delete tenant');
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

      const tenant = await TenantModel.findById(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // Check if user is already a member
      if (tenant.members.some(member => member.userId === userId)) {
        throw new ConflictError('User is already a member of this tenant');
      }

      tenant.members.push({ userId, role });
      await tenant.save();

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      logger.error('Failed to add member to tenant', error);
      throw new InternalServerError('Failed to add member to tenant');
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

      const tenant = await TenantModel.findById(tenantId);
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
      logger.error('Failed to remove member from tenant', error);
      throw new InternalServerError('Failed to remove member from tenant');
    }
  }
}