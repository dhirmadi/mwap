import { Request, Response } from 'express';
import { z } from 'zod';
import { InviteCodeModel } from './schema';
import { ProjectRole, ProjectModel } from '../projects/schema';

// Validation schemas
const createInviteSchema = z.object({
  projectId: z.string().min(1),
  role: z.enum([ProjectRole.ADMIN, ProjectRole.DEPUTY, ProjectRole.CONTRIBUTOR]),
  expiresIn: z.number().min(300).max(86400).optional() // 5min to 24h, optional
});

const redeemInviteSchema = z.object({
  code: z.string().min(8).max(32)
});

export class InviteController {
  /**
   * Generate a new invite code for a project
   * @requires requireProjectRole('admin' | 'deputy') - Only admins/deputies can create invites
   */
  static async createInvite(req: Request, res: Response) {
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
  }

  /**
   * Redeem an invite code to join a project
   * @requires withAuth - User must be authenticated to redeem invite
   */
  static async redeemInvite(req: Request, res: Response) {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }

      const userId = req.auth.sub;

      // Validate request body
      const { code } = redeemInviteSchema.parse(req.body);

      // Find and validate invite code
      const invite = await InviteCodeModel.findOne({ code });
      if (!invite) {
        return res.status(404).json({
          message: 'Invalid invite code'
        });
      }

      // Check if invite is expired
      if (invite.expiresAt < new Date()) {
        return res.status(400).json({
          message: 'Invite code has expired'
        });
      }

      // Check if invite is already redeemed
      if (invite.redeemedBy) {
        return res.status(400).json({
          message: 'Invite code has already been redeemed'
        });
      }

      // Find project and validate
      const project = await ProjectModel.findById(invite.projectId);
      if (!project) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      if (project.archived) {
        return res.status(400).json({
          message: 'Cannot join archived project'
        });
      }

      // Check if user is already a member
      const existingMember = project.members.find(member => 
        member.userId.toString() === userId
      );
      if (existingMember) {
        return res.status(400).json({
          message: 'User is already a member of this project'
        });
      }

      // Add user to project members
      project.members.push({
        userId: userId as any, // Auth0 ID is string, but Mongoose expects ObjectId
        role: invite.role
      });
      await project.save();

      // Mark invite as redeemed
      invite.redeemedBy = userId as any; // Auth0 ID is string, but Mongoose expects ObjectId
      await invite.save();

      return res.status(200).json({
        message: 'Invite code redeemed successfully',
        project: {
          id: project._id,
          name: project.name,
          role: invite.role,
          members: project.members.map(member => ({
            userId: member.userId,
            role: member.role
          }))
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid invite code format',
          errors: error.errors
        });
      }
      console.error('Error redeeming invite:', error);
      return res.status(500).json({
        message: 'Error redeeming invite code',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}