import { Request, Response } from 'express';
import { TenantModel } from './schema';

export class TenantController {
  /**
   * Create a new tenant for the authenticated user
   * @requires requireNoTenant - User must not already have a tenant
   */
  static async createTenant(req: Request, res: Response) {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }

      const userId = req.auth.sub;

      // Check if user already owns a tenant
      const existingTenant = await TenantModel.findOne({
        ownerId: userId,
        archived: false
      });

      if (existingTenant) {
        return res.status(400).json({
          message: 'User already owns a tenant'
        });
      }

      // Validate request body
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          message: 'Invalid tenant name'
        });
      }

      // Create new tenant
      const tenant = await TenantModel.create({
        ownerId: userId,
        name: name.trim(),
        createdAt: new Date(),
        archived: false
      });

      return res.status(201).json({
        message: 'Tenant created successfully',
        tenant: {
          id: tenant._id,
          name: tenant.name,
          ownerId: tenant.ownerId,
          createdAt: tenant.createdAt,
          archived: tenant.archived
        }
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      return res.status(500).json({
        message: 'Error creating tenant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get the authenticated user's tenant
   */
  static async getCurrentTenant(req: Request, res: Response) {
    // Stub: Return current user's tenant
    return res.status(200).json({
      id: 'stub-tenant-id',
      name: 'Stub Tenant',
      ownerId: 'stub-user-id',
      createdAt: new Date(),
      archived: false
    });
  }

  /**
   * Update tenant name or archive status
   * @requires requireTenantOwner - Only tenant owner can update
   */
  static async updateTenant(req: Request, res: Response) {
    const { id } = req.params;

    // Stub: Update tenant name/archive status
    return res.status(200).json({
      message: 'Tenant updated successfully',
      tenantId: id
    });
  }
}