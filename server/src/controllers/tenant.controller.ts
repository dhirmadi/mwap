import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Tenant, User } from '../models';
import { AppError } from '../utils/errors';

export class TenantController {
  /**
   * Request to create a new tenant
   */
  static async requestTenant(req: Request, res: Response) {
    const { name } = req.body;
    const auth0Id = req.user.auth0Id;

    // Find requesting user
    const user = await User.findOne({ auth0Id });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user already owns a tenant
    const existingTenant = await Tenant.findOne({
      owner: user._id,
      status: { $ne: 'archived' }
    });

    if (existingTenant) {
      throw new AppError('User already owns a tenant', 400);
    }

    // Check for duplicate name
    const existingName = await Tenant.findOne({ name: name.toLowerCase() });
    if (existingName) {
      throw new AppError('A tenant with this name already exists', 400);
    }

    // Create tenant in pending state
    const tenant = await Tenant.create({
      name,
      owner: user._id,
      createdBy: user._id,
      status: 'pending'
    });

    // Add tenant to user's tenants array as admin
    await User.findByIdAndUpdate(user._id, {
      $push: {
        tenants: {
          tenantId: tenant._id,
          role: 'admin'
        }
      }
    });

    res.status(201).json({
      message: 'Tenant request submitted successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        status: tenant.status
      }
    });
  }

  /**
   * List all pending tenant requests
   */
  static async listPendingTenants(req: Request, res: Response) {
    const pendingTenants = await Tenant.find({ status: 'pending' })
      .populate('owner', 'email name')
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 });

    res.json({
      tenants: pendingTenants.map(tenant => ({
        id: tenant._id,
        name: tenant.name,
        owner: tenant.owner,
        createdBy: tenant.createdBy,
        createdAt: tenant.createdAt
      }))
    });
  }

  /**
   * Approve a pending tenant request
   */
  static async approveTenant(req: Request, res: Response) {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tenant ID', 400);
    }

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    if (tenant.status !== 'pending') {
      throw new AppError('Tenant is not in pending state', 400);
    }

    tenant.status = 'active';
    await tenant.save();

    res.json({
      message: 'Tenant approved successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        status: tenant.status
      }
    });
  }

  /**
   * Archive a tenant
   */
  static async archiveTenant(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tenant ID', 400);
    }

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    if (tenant.status === 'archived') {
      throw new AppError('Tenant is already archived', 400);
    }

    tenant.status = 'archived';
    tenant.archivedAt = new Date();
    tenant.archivedReason = reason;
    await tenant.save();

    res.json({
      message: 'Tenant archived successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        status: tenant.status,
        archivedAt: tenant.archivedAt,
        archivedReason: tenant.archivedReason
      }
    });
  }
}