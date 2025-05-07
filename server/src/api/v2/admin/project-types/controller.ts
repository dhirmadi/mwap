import { Request, Response, NextFunction } from 'express';
import { ProjectTypeService } from './service';

export class ProjectTypeController {
  static async createProjectType(req: Request, res: Response, next: NextFunction) {
    try {
      const projectType = await ProjectTypeService.createProjectType(req.body);
      res.status(201).json({
        success: true,
        data: projectType
      });
    } catch (error) {
      next(error);
    }
  }

  static async listProjectTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const projectTypes = await ProjectTypeService.listProjectTypes();
      res.json({
        success: true,
        data: projectTypes
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProjectType(req: Request, res: Response, next: NextFunction) {
    try {
      const projectType = await ProjectTypeService.updateProjectType(
        req.params.id,
        req.body
      );
      res.json({
        success: true,
        data: projectType
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProjectType(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectTypeService.deleteProjectType(req.params.id);
      res.json({
        success: true,
        message: 'Project type deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}