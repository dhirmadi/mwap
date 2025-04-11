import { Request, Response } from 'express';
import { z } from 'zod';
import { ProjectRole, ProjectModel } from './schema';

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
  static async updateMemberRole(req: Request, res: Response) {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }

      const currentUserId = req.auth.sub;
      const { id: projectId, userId: targetUserId } = req.params;
      const { role: newRole } = updateRoleSchema.parse(req.body);

      // Find project and validate
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      if (project.archived) {
        return res.status(400).json({
          message: 'Cannot modify archived project'
        });
      }

      // Get current user's role
      const currentMember = project.members.find(
        member => member.userId.toString() === currentUserId
      );
      if (!currentMember) {
        return res.status(403).json({
          message: 'Not a member of this project'
        });
      }

      // Only admin/deputy can update roles
      if (![ProjectRole.ADMIN, ProjectRole.DEPUTY].includes(currentMember.role)) {
        return res.status(403).json({
          message: 'Insufficient permissions to update roles'
        });
      }

      // Find target member
      const targetMember = project.members.find(
        member => member.userId.toString() === targetUserId
      );
      if (!targetMember) {
        return res.status(404).json({
          message: 'Target member not found'
        });
      }

      // Cannot modify own role
      if (targetUserId === currentUserId) {
        return res.status(403).json({
          message: 'Cannot modify your own role'
        });
      }

      // Cannot modify role of member with same or higher role
      // Admin can modify anyone, Deputy can only modify contributors
      if (
        currentMember.role === ProjectRole.DEPUTY &&
        targetMember.role !== ProjectRole.CONTRIBUTOR
      ) {
        return res.status(403).json({
          message: 'Cannot modify role of member with same or higher role'
        });
      }

      // Cannot promote beyond own role level
      const roleHierarchy = {
        [ProjectRole.ADMIN]: 3,
        [ProjectRole.DEPUTY]: 2,
        [ProjectRole.CONTRIBUTOR]: 1
      };
      if (roleHierarchy[newRole] > roleHierarchy[currentMember.role]) {
        return res.status(403).json({
          message: 'Cannot promote beyond your own role level'
        });
      }

      // Update member role
      targetMember.role = newRole;
      await project.save();

      return res.status(200).json({
        message: 'Member role updated successfully',
        members: project.members.map(member => ({
          userId: member.userId,
          role: member.role
        }))
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid role',
          errors: error.errors
        });
      }
      console.error('Error updating member role:', error);
      return res.status(500).json({
        message: 'Error updating member role',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove member from project
   * @requires requireProjectRole('admin' | 'deputy') - Only admins/deputies can remove members
   */
  static async removeMember(req: Request, res: Response) {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }

      const currentUserId = req.auth.sub;
      const { id: projectId, userId: targetUserId } = req.params;

      // Find project and validate
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      if (project.archived) {
        return res.status(400).json({
          message: 'Cannot modify archived project'
        });
      }

      // Get current user's role
      const currentMember = project.members.find(
        member => member.userId.toString() === currentUserId
      );
      if (!currentMember) {
        return res.status(403).json({
          message: 'Not a member of this project'
        });
      }

      // Only admin/deputy can remove members
      if (![ProjectRole.ADMIN, ProjectRole.DEPUTY].includes(currentMember.role)) {
        return res.status(403).json({
          message: 'Insufficient permissions to remove members'
        });
      }

      // Find target member
      const targetMemberIndex = project.members.findIndex(
        member => member.userId.toString() === targetUserId
      );
      if (targetMemberIndex === -1) {
        return res.status(404).json({
          message: 'Target member not found'
        });
      }

      const targetMember = project.members[targetMemberIndex];

      // Cannot remove self
      if (targetUserId === currentUserId) {
        return res.status(403).json({
          message: 'Cannot remove yourself from project'
        });
      }

      // Cannot remove member with same or higher role
      // Admin can remove anyone, Deputy can only remove contributors
      if (
        currentMember.role === ProjectRole.DEPUTY &&
        targetMember.role !== ProjectRole.CONTRIBUTOR
      ) {
        return res.status(403).json({
          message: 'Cannot remove member with same or higher role'
        });
      }

      // Remove member
      project.members.splice(targetMemberIndex, 1);
      await project.save();

      return res.status(200).json({
        message: 'Member removed successfully',
        members: project.members.map(member => ({
          userId: member.userId,
          role: member.role
        }))
      });
    } catch (error) {
      console.error('Error removing member:', error);
      return res.status(500).json({
        message: 'Error removing member',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}