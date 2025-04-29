import { TenantModel } from '@models/v2/tenant.model';
import { TenantCreateSchema, TenantUpdateSchema } from './schema';
import { AppError } from '@core/errors/appError';
import type { TenantCreate, TenantUpdate } from './schema';
import type { User } from '@models/v2/user.model';

export class TenantService {
  static async createTenant(user: User, payload: TenantCreate) {
    const validationResult = TenantCreateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    // Check if user already has an active tenant
    const existingTenant = await TenantModel.findOne({
      ownerId: user._id,
      archived: false
    });

    if (existingTenant) {
      throw AppError.badRequest('User already has an active tenant');
    }

    try {
      const tenant = new TenantModel({
        ...payload,
        ownerId: user._id
      });
      await tenant.save();
      return tenant;
    } catch (error) {
      throw error;
    }
  }

  static async getTenant(tenantId: string) {
    const tenant = await TenantModel.findById(tenantId);
    
    if (!tenant) {
      throw AppError.notFound('Tenant not found');
    }

    return tenant;
  }

  static async updateTenant(tenantId: string, payload: TenantUpdate) {
    const validationResult = TenantUpdateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    const tenant = await TenantModel.findOneAndUpdate(
      { _id: tenantId, archived: false },
      { ...payload, updatedAt: new Date() },
      { new: true }
    );

    if (!tenant) {
      throw AppError.notFound('Tenant not found or archived');
    }

    return tenant;
  }

  static async archiveTenant(tenantId: string) {
    const tenant = await TenantModel.findOneAndUpdate(
      { _id: tenantId, archived: false },
      { archived: true, updatedAt: new Date() },
      { new: true }
    );

    if (!tenant) {
      throw AppError.notFound('Tenant not found or already archived');
    }

    return tenant;
  }
}