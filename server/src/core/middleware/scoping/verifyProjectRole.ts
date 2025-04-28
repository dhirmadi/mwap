import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/core/errors';
import { ProjectModel } from '@/features/projects/schemas';
import { AuthRequest } from '@/core/types/express';
import { ProjectRole } from '@/features/projects/types/roles';

/**
 * Middleware to verify if the user has the required role(s) in a project
 */
export const verifyProjectRole = (allowedRoles: ProjectRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { projectId } = req.params;

      if (!authReq.user?.id) {
        return next(new AppError('User not authenticated', 401));
      }

      if (!projectId) {
        return next(new AppError('Project ID is missing', 400));
      }

      const project = await ProjectModel.findById(projectId);

      if (!project) {
        return next(new AppError('Project not found', 404));
      }

      const member = project.members.find(
        (m) => m.userId.toString() === authReq.user!.id
      );

      if (!member) {
        return next(new AppError('User is not a member of this project', 403));
      }

      const role = member.role as ProjectRole;

      if (!allowedRoles.includes(role)) {
        return next(new AppError('Insufficient project permissions', 403));
      }

      // Attach project to request for downstream access if needed
      (authReq as any).project = project;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
