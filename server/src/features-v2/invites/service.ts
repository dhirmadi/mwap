/**
 * This module uses core-v2 only
 */

import { v4 as uuid } from 'uuid';
import { customAlphabet } from 'nanoid';
import { AppError } from '../../core-v2/errors';
import { logger } from '../../core-v2/logger';
import { verifyProjectRole } from '../projects/members';
import { ProjectModel } from '../projects/model';
import { InviteModel, type Invite, type InviteDTO, type RedeemDTO, type ProjectRole } from './model';

// Generate short, URL-safe codes
const generateCode = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 10);

// Default TTL for invites
const INVITE_TTL_DAYS = 7;

export class InviteService {
  async createInvite(
    projectId: string,
    role: ProjectRole,
    user: { sub: string; tenantId: string }
  ): Promise<InviteDTO> {
    try {
      // Verify project access
      await verifyProjectRole(user, projectId, ['OWNER', 'DEPUTY']);

      // Validate role
      if (!['MEMBER', 'DEPUTY'].includes(role)) {
        throw AppError.validation('Invalid role. Must be MEMBER or DEPUTY');
      }

      // Generate unique code
      const code = generateCode();

      // Create invite
      const invite: Invite = {
        id: uuid(),
        code,
        projectId,
        tenantId: user.tenantId,
        role,
        createdBy: user.sub,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
      };

      // Save invite
      await InviteModel.create(invite);

      // Log creation
      logger.info({
        action: 'createInvite',
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          projectId,
          role,
        },
      });

      // Return DTO
      return {
        code: invite.code,
        role: invite.role,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'createInvite',
        error,
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          projectId,
          role,
        },
      });
      throw AppError.internal('Failed to create invite');
    }
  }

  async redeemInvite(code: string, user: { sub: string; tenantId: string }): Promise<RedeemDTO> {
    try {
      // Load invite
      const invite = await InviteModel.findOne({ code });
      if (!invite) {
        throw AppError.notFound('Invite not found');
      }

      // Check expiry
      if (invite.expiresAt < new Date()) {
        await InviteModel.delete(invite.id);
        throw AppError.gone('Invite has expired');
      }

      // Check tenant match
      if (invite.tenantId !== user.tenantId) {
        throw AppError.forbidden('Invite belongs to a different tenant');
      }

      // Load project
      const project = await ProjectModel.findById(invite.projectId);
      if (!project) {
        throw AppError.notFound('Project not found');
      }

      // Check project status
      if (project.status !== 'active') {
        throw AppError.forbidden('Project is not active');
      }

      // Add member
      const updated = {
        ...project,
        members: {
          ...project.members,
          [user.sub]: {
            role: invite.role,
            addedAt: new Date(),
          },
        },
      };

      // Save changes
      await ProjectModel.update(project.id, updated);
      await InviteModel.delete(invite.id);

      // Log redemption
      logger.info({
        action: 'redeemInvite',
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          projectId: invite.projectId,
          role: invite.role,
        },
      });

      // Return success
      return {
        projectId: invite.projectId,
        role: invite.role,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'redeemInvite',
        error,
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          code,
        },
      });
      throw AppError.internal('Failed to redeem invite');
    }
  }

  async revokeInvite(code: string, user: { sub: string; tenantId: string }): Promise<void> {
    try {
      // Load invite
      const invite = await InviteModel.findOne({ code });
      if (!invite) {
        throw AppError.notFound('Invite not found');
      }

      // Verify project access
      await verifyProjectRole(user, invite.projectId, ['OWNER', 'DEPUTY']);

      // Delete invite
      await InviteModel.delete(invite.id);

      // Log revocation
      logger.info({
        action: 'revokeInvite',
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          projectId: invite.projectId,
          role: invite.role,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'revokeInvite',
        error,
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          code,
        },
      });
      throw AppError.internal('Failed to revoke invite');
    }
  }

  async listInvites(
    projectId: string,
    user: { sub: string; tenantId: string }
  ): Promise<InviteDTO[]> {
    try {
      // Verify project access
      await verifyProjectRole(user, projectId, ['OWNER', 'DEPUTY']);

      // Load valid invites
      const invites = await InviteModel.findMany({
        projectId,
        expiresAt: { $gt: new Date() },
      });

      // Return DTOs
      return invites.map((invite) => ({
        code: invite.code,
        role: invite.role,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'listInvites',
        error,
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        project: {
          id: projectId,
        },
      });
      throw AppError.internal('Failed to list invites');
    }
  }

  async resendInvite(code: string, user: { sub: string; tenantId: string }): Promise<InviteDTO> {
    try {
      // Load invite
      const invite = await InviteModel.findOne({ code });
      if (!invite) {
        throw AppError.notFound('Invite not found');
      }

      // Verify project access
      await verifyProjectRole(user, invite.projectId, ['OWNER', 'DEPUTY']);

      // Update expiry
      const updated = {
        ...invite,
        expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
      };

      // Save changes
      await InviteModel.update(invite.id, updated);

      // Log resend
      logger.info({
        action: 'resendInvite',
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          projectId: invite.projectId,
          role: invite.role,
        },
      });

      // Return DTO
      return {
        code: updated.code,
        role: updated.role,
        createdAt: updated.createdAt,
        expiresAt: updated.expiresAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'resendInvite',
        error,
        user: {
          id: user.sub,
          tenantId: user.tenantId,
        },
        invite: {
          code,
        },
      });
      throw AppError.internal('Failed to resend invite');
    }
  }
}
