import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { ProjectModel } from '@/features/projects/schemas';
import { ProjectRole } from '@/features/projects/types/roles';

export const verifyProjectRole = (requiredRole: ProjectRole) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { projectId } = req.params;
    
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const projectService = new ProjectModel();
    const project = await projectService.findById(projectId);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    const member = project.members.find(m => m.userId === req.user?.id);
    const roleLevel = {
      [ProjectRole.ADMIN]: 3,
      [ProjectRole.DEPUTY]: 2,
      [ProjectRole.CONTRIBUTOR]: 1
    };

    if (!member || roleLevel[member.role] < roleLevel[requiredRole]) {
      return next(new AppError(`Insufficient project role. Required: ${requiredRole}`, 403));
    }

    req.project = project;
    next();
  };
};