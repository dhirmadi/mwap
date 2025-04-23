import { Response, NextFunction } from 'express';
import { AuthRequest } from '@core/types/express';
import { ProjectModel } from '@features/projects/schemas';
import { AsyncController } from '@core/types/express';
import { logger } from '@core/utils';
import { DefaultPermissionService } from '@features/permissions/services/permission.service';
import { PERMISSIONS } from '@features/permissions/types';
import { AuthorizationError } from '@core/errors';

const permissionService = new DefaultPermissionService();

export const ProjectController: AsyncController = {
  /**
   * Create a new project in the tenant
   * @requires auth.validateRequest - User must be authenticated
   */
  createProject: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = req.body;
      
      // Check if user has permission to create project
      const canCreate = await permissionService.checkPermission(
        req.user,
        PERMISSIONS.PROJECT.CREATE,
        'project',
        tenantId
      );

      if (!canCreate) {
        throw new AuthorizationError('You do not have permission to create projects in this tenant');
      }

      // Create project and automatically assign creator as owner
      const project = await ProjectModel.create({
        ...req.body,
        members: [{
          userId: req.user.id,
          role: 'owner',
          grantedAt: new Date()
        }]
      });

      res.status(201).json({
        data: {
          id: project._id,
          name: project.name,
          tenantId: project.tenantId,
          role: 'owner',
          createdAt: project.createdAt
        },
        meta: {
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error('Error creating project', {
        userId: req.user.id,
        tenantId: req.body.tenantId,
        error
      });
      next(error);
    }
  },

  /**
   * List all projects in tenant
   * Returns empty array if user has no projects (not an error)
   * @requires requireProjectRole - Any role can list projects
   */
  listProjects: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('Listing projects for user', { userId: req.user.id });

      // Find all projects where user is a member
      const projects = await ProjectModel.find({
        'members.userId': req.user.id,
        archived: false
      }).select({
        _id: 1,
        name: 1,
        tenantId: 1,
        'members.$': 1, // Only include the matching member
        createdAt: 1,
        archived: 1
      });

      logger.debug('Found projects for user', {
        userId: req.user.id,
        count: projects.length
      });

      // Transform projects to include user's role
      const transformedProjects = projects.map(project => {
        const member = project.members[0]; // We only got the matching member due to $ projection
        return {
          id: project._id,
          name: project.name,
          tenantId: project.tenantId,
          role: member.role,
          archived: project.archived,
          createdAt: project.createdAt
        };
      });

      res.status(200).json({
        data: transformedProjects,
        meta: {
          requestId: req.id,
          pagination: {
            total: transformedProjects.length,
            page: 1,
            limit: 10
          }
        }
      });
    } catch (error) {
      logger.error('Error listing projects', {
        userId: req.user.id,
        error
      });
      next(error);
    }
  },

  /**
   * Get project by ID
   * Returns 404 if project doesn't exist (this IS an error)
   * @requires requireProjectRole - Any role can view project
   */
  getProject: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user.id;

    // Stub: Check if project exists
    const exists = id === 'stub-project-1';  // Simulate project existence check

    // Return 404 if project doesn't exist (this IS an error)
    if (!exists) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          message: `Project ${id} not found`,
          requestId: req.id
        }
      });
      return;
    }

    // Return project details
    res.status(200).json({
      data: {
        id,
        name: 'Stub Project',
        description: 'A stub project',
        tenantId: 'stub-tenant-1',
        createdBy: userId,
        role: 'OWNER',
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      meta: {
        requestId: req.id
      }
    });
  },

  /**
   * Update project name or archive status
   * @requires requireProjectRole('admin') - Only admins can update project
   */
  updateProject: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Stub: Update project details
    res.status(200).json({
      message: 'Project updated successfully',
      projectId: id
    });
  },

  /**
   * Delete/archive project
   * @requires requireProjectRole('admin') - Only admins can delete project
   */
  deleteProject: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Stub: Soft-delete project
    res.status(200).json({
      message: 'Project archived successfully',
      projectId: id
    });
  }
};