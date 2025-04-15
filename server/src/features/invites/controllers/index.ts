import { Request, Response } from 'express';
import { z } from 'zod';
import { InviteCodeModel } from '@features/invites/schemas';
import { ProjectRole } from '@features/projects/schemas';
import { AsyncController } from '@core/types/express';

// Validation schemas
const createInviteSchema = z.object({
  projectId: z.string().min(1),
  role: z.enum([ProjectRole.ADMIN, ProjectRole.DEPUTY, ProjectRole.CONTRIBUTOR]),
  expiresIn: z.number().min(300).max(86400).optional() // 5min to 24h, optional
});

const redeemInviteSchema = z.object({
  code: z.string().min(8).max(32)
});

export const InviteController: AsyncController = {
  /**
   * Generate a new invite code for a project
   * @requires requireProjectRole('admin' | 'deputy') - Only admins/deputies can create invites
   */
  createInvite: async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { projectId, role, expiresIn } = createInviteSchema.parse(req.body);

      // Stub: Create invite code
      return res.status(201).json({
        message: 'Invite code created successfully',
        code: 'STUB-INVITE-CODE',
        expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid request data',
          errors: error.errors
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Redeem an invite code to join a project
   * @requires withAuth - User must be authenticated to redeem invite
   */
  redeemInvite: async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { code } = redeemInviteSchema.parse(req.body);

      // Stub: Redeem invite code
      return res.status(200).json({
        message: 'Invite code redeemed successfully',
        projectId: 'stub-project-id',
        role: ProjectRole.CONTRIBUTOR
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid invite code',
          errors: error.errors
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};