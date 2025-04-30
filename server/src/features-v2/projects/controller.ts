/**
 * This module uses core-v2 only
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { ProjectService } from './service';
import { CreateProjectSchema, UpdateProjectSchema } from './model';

export class ProjectController {
  constructor(private service: ProjectService) {}

  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateProjectSchema.parse(req.body);
      const project = await this.service.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await this.service.getProject(req.params.id);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateProjectSchema.parse(req.body);
      const project = await this.service.updateProject(req.params.id, data);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteProject(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.params.tenantId || req.query.tenantId as string;
      if (!tenantId) {
        throw AppError.badRequest('tenantId is required');
      }
      const projects = await this.service.listProjects(tenantId);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  async archiveProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await this.service.archiveProject(req.params.id);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async restoreProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await this.service.restoreProject(req.params.id);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
}
