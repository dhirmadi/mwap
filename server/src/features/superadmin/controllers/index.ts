import { Request, Response } from 'express';
import { z } from 'zod';
import { AsyncController } from '@core/types/express';

// Validation schema for pagination
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const SuperAdminController: AsyncController = {
  /**
   * List all tenants with pagination
   * @requires requireSuperAdmin - Only super admins can access
   */
  async listTenants(req: Request, res: Response): Promise<void> {
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
  async listProjects(req: Request, res: Response): Promise<void> {
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
  async archiveTenant(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // Stub: Archive tenant and all its projects
    return res.status(200).json({
      message: 'Tenant and all associated projects archived successfully',
      tenantId: id
    });
  }
}