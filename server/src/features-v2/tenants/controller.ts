/**
 * This module uses core-v2 only
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { TenantService } from './service';
import { CreateTenantSchema, UpdateTenantSchema } from './model';

export class TenantController {
  constructor(private service: TenantService) {}

  async createTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateTenantSchema.parse(req.body);
      const tenant = await this.service.createTenant(data);
      res.status(201).json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async getTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenant = await this.service.getTenant(req.params.id);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateTenantSchema.parse(req.body);
      const tenant = await this.service.updateTenant(req.params.id, data);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteTenant(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async listTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await this.service.listTenants();
      res.json(tenants);
    } catch (error) {
      next(error);
    }
  }
}
