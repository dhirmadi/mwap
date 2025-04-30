import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { ProjectsService } from './service';
import { CreateProjectsSchema, UpdateProjectsSchema } from './model';

export class ProjectsController {
  constructor(private service: ProjectsService) {}

  async createProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateProjectsSchema.parse(req.body);
      const projects = await this.service.createProjects(data);
      res.status(201).json(projects);
    } catch (error) {
      next(error);
    }
  }

  async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await this.service.getProjects(req.params.id);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  async updateProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateProjectsSchema.parse(req.body);
      const projects = await this.service.updateProjects(req.params.id, data);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  async deleteProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteProjects(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async listProjectss(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectss = await this.service.listProjectss();
      res.json(projectss);
    } catch (error) {
      next(error);
    }
  }
}
