import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { ProjectTypesService } from './service';
import { CreateProjectTypesSchema, UpdateProjectTypesSchema } from './model';

export class ProjectTypesController {
  constructor(private service: ProjectTypesService) {}

  async createProjectTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateProjectTypesSchema.parse(req.body);
      const project-types = await this.service.createProjectTypes(data);
      res.status(201).json(project-types);
    } catch (error) {
      next(error);
    }
  }

  async getProjectTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project-types = await this.service.getProjectTypes(req.params.id);
      res.json(project-types);
    } catch (error) {
      next(error);
    }
  }

  async updateProjectTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateProjectTypesSchema.parse(req.body);
      const project-types = await this.service.updateProjectTypes(req.params.id, data);
      res.json(project-types);
    } catch (error) {
      next(error);
    }
  }

  async deleteProjectTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteProjectTypes(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async listProjectTypess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project-typess = await this.service.listProjectTypess();
      res.json(project-typess);
    } catch (error) {
      next(error);
    }
  }
}
