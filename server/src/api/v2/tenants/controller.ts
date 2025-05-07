import { Request, Response, NextFunction } from 'express';
import { TenantService } from './service';

export class TenantController {
  static async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.createTenant(req.user!, req.body);
      res.status(201).json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.getTenant(req.params.id);
      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.updateTenant(
        req.params.id,
        req.body
      );
      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }

  static async archiveTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.archiveTenant(req.params.id);
      res.json({
        success: true,
        data: tenant,
        message: 'Tenant archived successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}