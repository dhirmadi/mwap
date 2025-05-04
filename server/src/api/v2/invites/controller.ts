import { Request, Response, NextFunction } from 'express';
import { InviteService } from './service';
import { InviteCreateSchema, InviteRedeemSchema } from './schema';
import { AppError } from '@core-v2/errors/AppError';

export class InviteController {
  static async createInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = InviteCreateSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest('Invalid input', validationResult.error.format());
      }

      const invite = await InviteService.createInvite(
        req.user!,
        req.params.id,
        validationResult.data
      );

      res.json({
        success: true,
        data: invite
      });
    } catch (error) {
      next(error);
    }
  }

  static async listInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const invites = await InviteService.listInvites(req.params.id);

      res.json({
        success: true,
        data: invites
      });
    } catch (error) {
      next(error);
    }
  }

  static async redeemInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = InviteRedeemSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest('Invalid input', validationResult.error.format());
      }

      const result = await InviteService.redeemInvite(validationResult.data.code);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}