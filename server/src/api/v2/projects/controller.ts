import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { ProjectService } from './service';
import { AppError } from '@core/errors/appError';

export class ProjectController {
  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.user!, {
        ...req.body,
        tenantId: new Types.ObjectId(req.body.tenantId)
      });

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getProject(req.params.id);

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateProject(req.params.id, req.body);

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async archiveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.archiveProject(req.params.id);

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await ProjectService.addMember(
        req.params.id,
        req.user!,
        req.body
      );

      res.json({
        success: true,
        data: member
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectService.removeMember(
        req.params.id,
        req.user!,
        req.params.userId
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await ProjectService.updateMemberRole(
        req.params.id,
        req.user!,
        req.params.userId,
        req.body
      );

      res.json({
        success: true,
        data: member
      });
    } catch (error) {
      next(error);
    }
  }
}