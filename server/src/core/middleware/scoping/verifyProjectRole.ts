import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { ProjectService } from '../../../features/project/services/project.service';
import { ProjectRole } from '../../../features/project/types';

export const verifyProjectRole = (requiredRole: ProjectRole) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { projectId } = req.params;
    
    if (!req.user?.id) {
      return next(new AppError(ErrorCode.UNAUTHORIZED, 'User not authenticated'));
    }

    const projectService = new ProjectService();
    const project = await projectService.findById(projectId);

    if (!project) {
      return next(new AppError(ErrorCode.NOT_FOUND, 'Project not found'));
    }

    const member = project.members.find(m => m.userId === req.user?.id);
    const roleLevel = {
      [ProjectRole.ADMIN]: 3,
      [ProjectRole.DEPUTY]: 2,
      [ProjectRole.CONTRIBUTOR]: 1
    };

    if (!member || roleLevel[member.role] < roleLevel[requiredRole]) {
      return next(new AppError(
        ErrorCode.FORBIDDEN,
        `Insufficient project role. Required: ${requiredRole}`
      ));
    }

    req.project = project;
    next();
  };
};