/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors/AppError';
import { ProjectModel } from '@models/v2/project.model'; // or TenantModel if checking tenant directly

export const requireTenantOwner = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const projectId = req.params.id || req.body.projectId;

  if (!userId || !projectId) {
    return next(new AppError('UNAUTHORIZED', 401, { reason: 'Missing user or project context' }));
  }

  const project = await ProjectModel.findById(projectId).lean();
  if (!project) {
    return next(new AppError('PROJECT_NOT_FOUND', 404));
  }

  if (String(project.tenantId) !== String(req.user.tenantId)) {
    return next(new AppError('FORBIDDEN', 403, { reason: 'User does not own tenant' }));
  }

  return next();
};
