import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectRole, hasHigherOrEqualRole } from '../types';
import { ValidationError, AuthorizationError } from '@core/errors';

// Validation schema for role update
const updateRoleSchema = z.object({
  role: z.enum([ProjectRole.ADMIN, ProjectRole.DEPUTY, ProjectRole.CONTRIBUTOR])
});

export class ProjectMemberController {
  /**
   * Update member role in project
   * @requires requireProjectRole('admin' | 'deputy') - Only admins/deputies can change roles
   * @requires validateRoleHierarchy - Cannot promote beyond own role
   */
  static async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: projectId, userId } = req.params;
      const { role } = updateRoleSchema.parse(req.body);

      // Stub: Check if user is trying to modify themselves
      if (userId === 'current-user-id') {
        throw new AuthorizationError('Cannot modify your own role');
      }

      // Stub: Check if current user can assign the target role
      const currentUserRole: ProjectRole = ProjectRole.ADMIN; // This would come from middleware
      if (!hasHigherOrEqualRole(currentUserRole, role)) {
        throw new AuthorizationError('Cannot assign a role higher than or equal to your own');
      }

      // Stub: Update member role
      res.status(200).json({
        message: 'Member role updated successfully',
        projectId,
        userId,
        role
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Invalid role', { errors: error.errors }));
        return;
      }
      next(error);
    }
  }

  /**
   * Remove member from project
   * @requires requireProjectRole('admin' | 'deputy') - Only admins/deputies can remove members
   */
  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: projectId, userId } = req.params;

      // Stub: Check if user is trying to remove themselves
      if (userId === 'current-user-id') {
        throw new AuthorizationError('Cannot remove yourself from project');
      }

      // Stub: Check if target user has higher role
      const targetRole: ProjectRole = ProjectRole.ADMIN; // This would come from DB lookup
      const currentUserRole: ProjectRole = ProjectRole.DEPUTY; // This would come from middleware

      // Check if current user has sufficient role to remove target user
      if (!hasHigherOrEqualRole(currentUserRole, targetRole)) {
        throw new AuthorizationError('Cannot remove a member with higher or equal role');
      }

      // Stub: Remove member
      res.status(200).json({
        message: 'Member removed successfully',
        projectId,
        userId
      });
    } catch (error) {
      next(error);
    }
  }
}