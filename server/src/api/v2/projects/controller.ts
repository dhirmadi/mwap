import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './service';
import { AppError } from '../../../utils/errors';

export class ProjectController {
  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.user!, req.body);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getProject(req.params.id, req.user!.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateProject(req.params.id, req.user!.id, req.body);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async archiveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.archiveProject(req.params.id, req.user!.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }
}