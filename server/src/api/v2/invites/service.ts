import { Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { InviteModel } from '@models-v2/invite.model';
import { ProjectModel } from '@models-v2/project.model';
import { AppError } from '@core-v2/errors/AppError';
import { UserMigration } from '@core-v2/auth/userMigration';
import type { User } from '@models-v2/user.model';
import type { InviteCreate } from './schema';

export class InviteService {
  private static generateInviteCode(): string {
    return randomBytes(16).toString('hex');
  }

  static async createInvite(user: User, projectId: string, payload: InviteCreate) {
    // Get user ID safely
    const userId = UserMigration.getUserId(user);

    // Verify project exists and user has ownership
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(projectId),
      ownerId: userId,
      archived: false
    });

    if (!project) {
      throw AppError.notFound('Project not found or access denied');
    }

    // Generate unique invite code
    let code: string;
    let existingInvite;
    do {
      code = this.generateInviteCode();
      existingInvite = await InviteModel.findOne({ code });
    } while (existingInvite);

    // Check for existing active invite for the same email
    const activeInvite = await InviteModel.findOne({
      projectId: project._id,
      email: payload.email.toLowerCase(),
      redeemed: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (activeInvite) {
      throw AppError.badRequest('Active invite already exists for this email');
    }

    // Create new invite
    const invite = new InviteModel({
      projectId: project._id,
      email: payload.email.toLowerCase(),
      role: payload.role,
      code,
      expiresAt: payload.expiresAt,
      redeemed: false
    });

    await invite.save();
    return invite;
  }

  static async redeemInvite(code: string) {
    const invite = await InviteModel.findOne({ code });

    if (!invite) {
      throw AppError.notFound('Invalid invite code');
    }

    if (invite.redeemed) {
      throw AppError.badRequest('Invite has already been redeemed');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw AppError.badRequest('Invite has expired');
    }

    // Verify project still exists
    const project = await ProjectModel.findOne({
      _id: invite.projectId,
      archived: false
    });

    if (!project) {
      throw AppError.notFound('Project not found or has been archived');
    }

    // Mark invite as redeemed
    invite.redeemed = true;
    await invite.save();

    return {
      invite,
      project
    };
  }

  static async listInvites(projectId: string) {
    const invites = await InviteModel.find({
      projectId: new Types.ObjectId(projectId),
      $or: [
        { redeemed: false },
        { createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Show last 30 days
      ]
    }).sort({ createdAt: -1 });

    return invites;
  }
}