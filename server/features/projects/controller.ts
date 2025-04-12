import { Request, Response } from 'express';
import { ProjectModel } from './schema';

export class ProjectController {
  /**
   * Create a new project in the tenant
   * @requires requireTenantOwner - Only tenant owner can create projects
   */
  static async createProject(req: Request, res: Response) {
    // Stub: Create project in tenant
    return res.status(201).json({
      message: 'Project created successfully',
      projectId: 'stub-project-id'
    });
  }

  /**
   * List all projects in tenant
   * @requires requireProjectRole - Any role can list projects
   */
  static async listProjects(req: Request, res: Response) {
    // Stub: List all projects user has access to
    return res.status(200).json({
      projects: [
        {
          id: 'stub-project-1',
          name: 'Stub Project 1',
          tenantId: 'stub-tenant-id',
          members: [{ userId: 'stub-user-id', role: 'admin' }],
          archived: false,
          createdAt: new Date()
        }
      ]
    });
  }

  /**
   * Get project by ID
   * @requires requireProjectRole - Any role can view project
   */
  static async getProject(req: Request, res: Response) {
    const { id } = req.params;

    // Stub: Return project details
    return res.status(200).json({
      id,
      name: 'Stub Project',
      tenantId: 'stub-tenant-id',
      members: [{ userId: 'stub-user-id', role: 'admin' }],
      archived: false,
      createdAt: new Date()
    });
  }

  /**
   * Update project name or archive status
   * @requires requireProjectRole('admin') - Only admins can update project
   */
  static async updateProject(req: Request, res: Response) {
    const { id } = req.params;

    // Stub: Update project details
    return res.status(200).json({
      message: 'Project updated successfully',
      projectId: id
    });
  }

  /**
   * Delete/archive project
   * @requires requireProjectRole('admin') - Only admins can delete project
   */
  static async deleteProject(req: Request, res: Response) {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }

      const currentUserId = req.auth.sub;
      const { id: projectId } = req.params;

      // Find project and validate
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      // Check if project is already archived
      if (project.archived) {
        return res.status(400).json({
          message: 'Project is already archived'
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

      // Only admin can archive project
      if (currentMember.role !== 'admin') {
        return res.status(403).json({
          message: 'Only project admin can archive the project'
        });
      }

      // Soft-delete project
      project.archived = true;
      await project.save();

      return res.status(200).json({
        message: 'Project archived successfully',
        project: {
          id: project._id,
          name: project.name,
          archived: project.archived,
          createdAt: project.createdAt,
          members: project.members.map(member => ({
            userId: member.userId,
            role: member.role
          }))
        }
      });
    } catch (error) {
      console.error('Error archiving project:', error);
      return res.status(500).json({
        message: 'Error archiving project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}