/**
 * This module uses core-v2 only
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { ProjectTypeService } from './service';
import { CreateProjectTypeSchema, UpdateProjectTypeSchema } from './model';

export class ProjectTypeController {
  private service: ProjectTypeService;

  constructor() {
    this.service = new ProjectTypeService();
  }

  async createProjectType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateProjectTypeSchema.parse(req.body);
      const projectType = await this.service.createProjectType(data);
      res.status(201).json(projectType);
    } catch (error) {
      next(error);
    }
  }

  async getProjectType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectType = await this.service.getProjectType(req.params.id);
      res.json(projectType);
    } catch (error) {
      next(error);
    }
  }

  async updateProjectType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateProjectTypeSchema.parse(req.body);
      const projectType = await this.service.updateProjectType(req.params.id, data);
      res.json(projectType);
    } catch (error) {
      next(error);
    }
  }

  async deleteProjectType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteProjectType(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async listProjectTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const projectTypes = await this.service.listProjectTypes(req.user, includeInactive);
      res.json(projectTypes);
    } catch (error) {
      next(error);
    }
  }

  async activateProjectType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectType = await this.service.activateProjectType(req.params.id);
      res.json(projectType);
    } catch (error) {
      next(error);
    }
  }

  async deactivateProjectType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deactivateProjectType(req.params.id);
      res.status(204).json();
    } catch (error) {
      next(error);
    }
  }
}
