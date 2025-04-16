import { Response, NextFunction } from 'express';
import { AuthRequest } from '@core/types/express';
import { TenantModel } from '@features/tenant/schemas';
import { ProjectModel, ProjectRole } from '@features/projects/schemas';
import { AuthenticationError, AuthorizationError, NotFoundError } from '@core/errors';
import { logger } from '@core/utils';

/**
 * Middleware to ensure user doesn't already have a tenant
 */
export function requireNoTenant() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Stub: Check if user already has a tenant
    const hasTenant = false;
    if (hasTenant) {
      res.status(403).json({
        message: 'User already has a tenant'
      });
      return;
    }
    next();
  };
}

/**
 * Middleware to ensure user owns the tenant
 */
export function requireTenantOwner() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: tenantId } = req.params;
    const userId = req.user?.sub;

    // Stub: Check if user owns the tenant
    const isOwner = false;
    if (!isOwner) {
      res.status(403).json({
        message: 'Only tenant owner can perform this action'
      });
      return;
    }
    next();
  };
}

/**
 * Middleware to ensure user has required project role(s)
 * @param roles Array of roles that can access the resource
 */
export function requireProjectRole(roles: ProjectRole[] = [ProjectRole.ADMIN, ProjectRole.DEPUTY, ProjectRole.CONTRIBUTOR]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate user
      if (!req.user) {
        logger.error('User not authenticated in requireProjectRole');
        throw new AuthenticationError('User not authenticated');
      }

      // Get project ID from params or query
      const projectId = req.params.id || req.query.projectId;
      if (!projectId) {
        logger.error('Missing project ID in requireProjectRole', { userId: req.user.id });
        throw new AuthorizationError('Missing project ID');
      }

      // Find project and validate membership
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        logger.error('Project not found in requireProjectRole', { projectId, userId: req.user.id });
        throw new NotFoundError('Project not found');
      }

      // Check member role
      const member = project.members.find(m => m.userId.toString() === req.user.id);
      if (!member || !roles.includes(member.role)) {
        logger.error('User lacks required role', {
          userId: req.user.id,
          projectId,
          userRole: member?.role,
          requiredRoles: roles
        });
        throw new AuthorizationError('Insufficient permissions');
      }

      // Add project to request for downstream use
      req.project = project;
      next();
    } catch (error) {
      logger.error('Error in requireProjectRole middleware', {
        userId: req.user?.id,
        projectId: req.params.id || req.query.projectId,
        error
      });
      next(error);
    }
  };
}