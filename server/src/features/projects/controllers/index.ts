import { Response, NextFunction } from 'express';
import { AuthRequest } from '@core/types/express';
import { ProjectModel, ProjectRole } from '@features/projects/schemas';
import { AsyncController } from '@core/types/express';
import { logger } from '@core/utils';
import { getUserIdentifier } from '@core/utils/user-mapping';
import { DefaultPermissionService } from '@features/permissions/services/permission.service';
import { PERMISSIONS } from '@features/permissions/types';
import { AuthorizationError } from '@core/errors';

const permissionService = new DefaultPermissionService();

export const ProjectController: AsyncController = {

  createProject: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = req.body;
      
      // Debug logging for request context
      logger.info('[PROJECT CREATION - REQUEST]', {
        headers: {
          'x-tenant-id': req.headers['x-tenant-id'],
          'x-request-id': req.id,
          'authorization': req.headers.authorization ? 'Bearer [REDACTED]' : 'MISSING'
        },
        body: {
          ...req.body,
          tenantId
        },
        user: {
          id: req.user.id,
          sub: req.user.sub,
          roles: req.user.roles
        }
      });

      // Debug logging for permission check inputs
      logger.info('[PROJECT CREATION - PERMISSION CHECK]', {
        user: {
          id: req.user.id,
          sub: req.user.sub,
          roles: req.user.roles
        },
        permission: PERMISSIONS.PROJECT.CREATE,
        resource: 'project',
        tenantId,
        headers: {
          'x-tenant-id': req.headers['x-tenant-id']
        }
      });
      
      // Check if user has permission to create project
      const canCreate = await permissionService.checkPermission(
        req.user,
        PERMISSIONS.PROJECT.CREATE,
        'project',
        tenantId
      );

      // Debug logging for permission check result
      logger.info('[PROJECT CREATION - PERMISSION RESULT]', {
        canCreate,
        user: req.user.id,
        tenantId,
        permission: PERMISSIONS.PROJECT.CREATE
      });

      if (!canCreate) {
        // Debug logging for permission denial
        logger.warn('[PROJECT CREATION - PERMISSION DENIED]', {
          user: {
            id: req.user.id,
            sub: req.user.sub,
            roles: req.user.roles
          },
          tenantId,
          permission: PERMISSIONS.PROJECT.CREATE,
          headers: req.headers
        });
        
        throw new AuthorizationError('You do not have permission to create projects in this tenant');
      }

      // Debug logging for project creation attempt
      logger.info('[PROJECT CREATION - CREATING]', {
        projectData: {
          ...req.body,
          userId: req.user.id,
          role: ProjectRole.OWNER
        },
        context: {
          requestId: req.id,
          tenantId: req.body.tenantId
        }
      });

      // Create project and automatically assign creator as owner using auth ID
      const project = await ProjectModel.create({
        name: req.body.name,
        description: req.body.description,
        tenantId: req.body.tenantId,
        cloudProvider: req.body.provider.toUpperCase(),
        cloudFolder: {
          id: req.body.folderPath,
          path: req.body.folderPath
        },
        members: [{
          userId: getUserIdentifier(req.user, 'auth'),
          role: ProjectRole.OWNER,
          grantedAt: new Date()
        }]
      });

      // Debug logging for successful project creation
      logger.info('[PROJECT CREATION - SUCCESS]', {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          tenantId: project.tenantId,
          members: project.members,
          createdAt: project.createdAt,
          cloudProvider: project.cloudProvider,
          cloudFolder: project.cloudFolder
        },
        user: {
          id: req.user.id,
          role: ProjectRole.OWNER
        },
        context: {
          requestId: req.id,
          tenantHeaders: req.headers['x-tenant-id']
        }
      });

      // Return project details in standard format
      const response = {
        data: {
          id: project._id,
          name: project.name,
          description: project.description,
          tenantId: project.tenantId,
          role: ProjectRole.OWNER,
          createdAt: project.createdAt,
          cloudProvider: project.cloudProvider,
          cloudFolder: project.cloudFolder
        },
        meta: {
          requestId: req.id
        }
      };

      // Debug logging for response
      logger.info('[PROJECT CREATION - RESPONSE]', {
        response,
        context: {
          statusCode: 201,
          requestId: req.id
        }
      });

      res.status(201).json(response);
    } catch (error) {
      // Detailed error logging
      const err = error as Error & { code?: string; status?: number };
      logger.error('[PROJECT CREATION - ERROR]', {
        error: {
          name: err.name,
          message: err.message,
          code: err.code,
          status: err.status,
          stack: err.stack
        },
        context: {
          userId: req.user.id,
          tenantId: req.body.tenantId,
          requestId: req.id,
          headers: {
            'x-tenant-id': req.headers['x-tenant-id'],
            'authorization': req.headers.authorization ? 'Bearer [REDACTED]' : 'MISSING'
          }
        },
        request: {
          body: req.body,
          user: {
            id: req.user.id,
            sub: req.user.sub,
            roles: req.user.roles
          }
        }
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
      // CRITICAL: Query should use auth ID
      // Current:   req.user.id
      // Should be: getUserIdentifier(req.user, 'auth')
      const projects = await ProjectModel.find({
        'members.userId': req.user.id, 
        archived: false
      }).select({
        _id: 1,
        name: 1,
        description: 1,
        tenantId: 1,
        'members.$': 1,
        createdAt: 1,
        archived: 1,
        cloudProvider: 1,
        cloudFolder: 1
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
          description: project.description,
          tenantId: project.tenantId,
          role: member.role,
          archived: project.archived,
          createdAt: project.createdAt,
          cloudProvider: project.cloudProvider,
          cloudFolder: project.cloudFolder
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