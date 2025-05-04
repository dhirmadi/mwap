import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core-v2/errors';
import { logger } from '../core-v2/logger';
import { ProjectModel } from '../features-v2/projects/model';

/**
 * Verify project role
 */
export function verifyProjectRole(requiredRole: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 'AUTH_NO_USER', 401);
      }

      const projectId = req.params.projectId;
      if (!projectId) {
        throw new AppError('Project ID required', 'VALIDATION_ERROR', 400);
      }

      const project = await ProjectModel.findById(projectId);
      if (!project) {
        throw new AppError('Project not found', 'NOT_FOUND', 404);
      }

      // Check if user has required role
      const userRole = project.members.find(m => m.userId === req.user!.id)?.role;
      if (!userRole) {
        throw new AppError('Not a project member', 'AUTH_FORBIDDEN', 403);
      }

      // Role hierarchy: owner > deputy > contributor
      const roles = ['owner', 'deputy', 'contributor'];
      const requiredRoleIndex = roles.indexOf(requiredRole);
      const userRoleIndex = roles.indexOf(userRole);

      if (userRoleIndex > requiredRoleIndex) {
        throw new AppError('Insufficient project role', 'AUTH_FORBIDDEN', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}