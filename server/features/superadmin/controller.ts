import { Request, Response } from 'express';
import { z } from 'zod';
import { TenantModel } from '../tenant/schema';
import { ProjectModel } from '../projects/schema';

// Validation schema for pagination
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export class SuperAdminController {
  /**
   * List all tenants with pagination
   * @requires requireSuperAdmin - Only super admins can access
   */
  static async listTenants(req: Request, res: Response) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);

      // Stub: Return paginated list of tenants
      return res.status(200).json({
        tenants: [
          {
            id: 'stub-tenant-1',
            name: 'Stub Tenant 1',
            ownerId: 'stub-user-1',
            archived: false,
            createdAt: new Date()
          }
        ],
        pagination: {
          page,
          limit,
          total: 1,
          totalPages: 1
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid pagination parameters',
          errors: error.errors
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * List all projects with pagination
   * @requires requireSuperAdmin - Only super admins can access
   */
  static async listProjects(req: Request, res: Response) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);

      // Stub: Return paginated list of projects
      return res.status(200).json({
        projects: [
          {
            id: 'stub-project-1',
            name: 'Stub Project 1',
            tenantId: 'stub-tenant-1',
            archived: false,
            createdAt: new Date(),
            memberCount: 3
          }
        ],
        pagination: {
          page,
          limit,
          total: 1,
          totalPages: 1
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid pagination parameters',
          errors: error.errors
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Archive a tenant (soft-delete)
   * @requires requireSuperAdmin - Only super admins can archive tenants
   */
  static async archiveTenant(req: Request, res: Response) {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }

      const { id: tenantId } = req.params;

      // Find tenant and validate
      const tenant = await TenantModel.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({
          message: 'Tenant not found'
        });
      }

      // Check if tenant is already archived
      if (tenant.archived) {
        return res.status(400).json({
          message: 'Tenant is already archived'
        });
      }

      // Archive tenant
      tenant.archived = true;
      await tenant.save();

      // Archive all tenant's projects
      await ProjectModel.updateMany(
        { tenantId: tenant._id, archived: false },
        { archived: true }
      );

      // Get count of archived projects
      const archivedProjectsCount = await ProjectModel.countDocuments({
        tenantId: tenant._id,
        archived: true
      });

      return res.status(200).json({
        message: 'Tenant and all associated projects archived successfully',
        tenant: {
          id: tenant._id,
          name: tenant.name,
          ownerId: tenant.ownerId,
          archived: tenant.archived,
          createdAt: tenant.createdAt
        },
        archivedProjectsCount
      });
    } catch (error) {
      console.error('Error archiving tenant:', error);
      return res.status(500).json({
        message: 'Error archiving tenant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}