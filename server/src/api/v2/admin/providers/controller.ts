import { Request, Response, NextFunction } from 'express';
import { CloudProviderService } from './service';

export class CloudProviderController {
  static async createCloudProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = await CloudProviderService.createCloudProvider(req.body);
      res.status(201).json({
        success: true,
        data: provider
      });
    } catch (error) {
      next(error);
    }
  }

  static async listCloudProviders(_req: Request, res: Response, next: NextFunction) {
    try {
      const providers = await CloudProviderService.listCloudProviders();
      res.json({
        success: true,
        data: providers
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCloudProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = await CloudProviderService.updateCloudProvider(
        req.params.id,
        req.body
      );
      res.json({
        success: true,
        data: provider
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCloudProvider(req: Request, res: Response, next: NextFunction) {
    try {
      await CloudProviderService.deleteCloudProvider(req.params.id);
      res.json({
        success: true,
        message: 'Cloud provider deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}