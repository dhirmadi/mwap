import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { InviteCode, Tenant, User } from '../models';
import { AppError } from '../utils/errors';
import { generateUUID, isValidUUID } from '../utils/uuid';

export class InviteController {
  /**
   * Generate an invite code for a tenant
   */
  static async generateInvite(req: Request, res: Response) {
    const { tenantId } = req.params;
    const { role, expiresInHours = 48 } = req.body;
    const auth0Id = req.user.auth0Id;

    // Validate role
    if (!['deputy', 'contributor'].includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Validate tenant ID
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new AppError('Invalid tenant ID', 400);
    }

    // Find current user
    const user = await User.findOne({ auth0Id });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check user's role in the tenant
    const membership = user.tenants.find(t => t.tenantId.toString() === tenantId);
    if (!membership || !['admin', 'deputy'].includes(membership.role)) {
      throw new AppError('Insufficient permissions to generate invite', 403);
    }

    // Generate and store invite code
    const code = generateUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const invite = await InviteCode.create({
      code,
      tenantId: new Types.ObjectId(tenantId),
      role,
      createdBy: user._id,
      expiresAt,
      used: false
    });

    res.status(201).json({
      message: 'Invite code generated successfully',
      invite: {
        code: invite.code,
        role: invite.role,
        expiresAt: invite.expiresAt
      }
    });
  }

  /**
   * Join a tenant using an invite code
   */
  static async joinTenant(req: Request, res: Response) {
    const { code } = req.body;
    const auth0Id = req.user.auth0Id;

    // Validate UUID format
    if (!isValidUUID(code)) {
      throw new AppError('Invalid invite code format', 400);
    }

    // Find and validate invite code
    const invite = await InviteCode.findOne({ code });
    if (!invite) {
      throw new AppError('Invalid invite code', 404);
    }

    if (invite.used) {
      throw new AppError('This invite code has already been used', 400);
    }

    if (invite.expiresAt < new Date()) {
      throw new AppError('This invite code has expired', 400);
    }

    // Find user
    const user = await User.findOne({ auth0Id });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is already in the tenant
    if (user.tenants.some(t => t.tenantId.equals(invite.tenantId))) {
      throw new AppError('You are already a member of this tenant', 400);
    }

    // Get tenant info
    const tenant = await Tenant.findById(invite.tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // Add user to tenant
    await User.findByIdAndUpdate(user._id, {
      $push: {
        tenants: {
          tenantId: invite.tenantId,
          role: invite.role
        }
      }
    });

    // Mark invite as used
    invite.used = true;
    invite.usedBy = user._id;
    await invite.save();

    res.json({
      message: 'Successfully joined tenant',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        role: invite.role
      }
    });
  }

  /**
   * List all members of a tenant
   */
  static async listMembers(req: Request, res: Response) {
    const { tenantId } = req.params;
    const auth0Id = req.user.auth0Id;

    // Validate tenant ID
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new AppError('Invalid tenant ID', 400);
    }

    // Find current user and check permissions
    const currentUser = await User.findOne({ auth0Id });
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    const membership = currentUser.tenants.find(t => t.tenantId.toString() === tenantId);
    if (!membership || !['admin', 'deputy'].includes(membership.role)) {
      throw new AppError('Insufficient permissions to view members', 403);
    }

    // Find all users in the tenant using aggregation
    const members = await User.aggregate([
      {
        $match: {
          'tenants.tenantId': new Types.ObjectId(tenantId)
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: '$email.value', // Get encrypted email value
          role: {
            $filter: {
              input: '$tenants',
              as: 'tenant',
              cond: { $eq: ['$$tenant.tenantId', new Types.ObjectId(tenantId)] }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: { $arrayElemAt: ['$role.role', 0] }
        }
      }
    ]);

    res.json({
      members: members.map(member => ({
        id: member._id,
        name: member.name || 'Unnamed User',
        email: member.email,
        role: member.role
      }))
    });
  }
}