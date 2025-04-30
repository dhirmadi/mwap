import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { InvitesService } from './service';
import { CreateInvitesSchema, UpdateInvitesSchema } from './model';

export class InvitesController {
  constructor(private service: InvitesService) {}

  async createInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateInvitesSchema.parse(req.body);
      const invites = await this.service.createInvites(data);
      res.status(201).json(invites);
    } catch (error) {
      next(error);
    }
  }

  async getInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invites = await this.service.getInvites(req.params.id);
      res.json(invites);
    } catch (error) {
      next(error);
    }
  }

  async updateInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateInvitesSchema.parse(req.body);
      const invites = await this.service.updateInvites(req.params.id, data);
      res.json(invites);
    } catch (error) {
      next(error);
    }
  }

  async deleteInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteInvites(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async listInvitess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitess = await this.service.listInvitess();
      res.json(invitess);
    } catch (error) {
      next(error);
    }
  }
}
