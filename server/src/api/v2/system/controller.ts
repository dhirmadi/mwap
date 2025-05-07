import { Request, Response, NextFunction } from 'express';
import { SystemService } from './service';

export class SystemController {
  static async getSystemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = SystemService.getSystemStatus();

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const features = SystemService.getSystemFeatures();

      res.json({
        success: true,
        data: features
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = SystemService.getSystemVersion();

      res.json({
        success: true,
        data: version
      });
    } catch (error) {
      next(error);
    }
  }
}