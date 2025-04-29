import { Request, Response, NextFunction } from 'express';
import { CloudService } from './service';
import { StartOAuthSchema, CompleteOAuthSchema, ListFoldersSchema } from './schema';
import { AppError } from '@core/errors/appError';

export class CloudController {
  static async startOAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = StartOAuthSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest('Invalid input', validationResult.error.format());
      }

      const result = await CloudService.startOAuth(
        validationResult.data.providerId,
        req.user!
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeOAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = CompleteOAuthSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest('Invalid input', validationResult.error.format());
      }

      const result = await CloudService.completeOAuth(
        validationResult.data.code,
        validationResult.data.state
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async listFolders(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = ListFoldersSchema.safeParse(req.query);
      if (!validationResult.success) {
        throw AppError.badRequest('Invalid input', validationResult.error.format());
      }

      const { provider, token, path } = validationResult.data;
      const result = await CloudService.listFolders(provider, token, path);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}