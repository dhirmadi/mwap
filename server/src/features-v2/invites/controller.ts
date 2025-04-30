/**
 * This module uses core-v2 only
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { InviteService } from './service';
import { CreateInviteSchema, UpdateInviteSchema } from './model';

export class InviteController {
  constructor(private service: InviteService) {}

  async createInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateInviteSchema.parse(req.body);
      const invite = await this.service.createInvite(data);
      res.status(201).json(invite);
    } catch (error) {
      next(error);
    }
  }

  async getInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invite = await this.service.getInvite(req.params.id);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }

  async updateInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateInviteSchema.parse(req.body);
      const invite = await this.service.updateInvite(req.params.id, data);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }

  async deleteInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteInvite(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async listInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.projectId || req.query.projectId as string;
      if (!projectId) {
        throw AppError.badRequest('projectId is required');
      }
      const invites = await this.service.listInvites(projectId);
      res.json(invites);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invite = await this.service.acceptInvite(req.params.id);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }

  async rejectInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invite = await this.service.rejectInvite(req.params.id);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }

  async resendInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invite = await this.service.resendInvite(req.params.id);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }

  async revokeInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invite = await this.service.revokeInvite(req.params.id);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }
}
