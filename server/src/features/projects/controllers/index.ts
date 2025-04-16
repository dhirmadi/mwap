import { Response } from 'express';
import { AuthRequest } from '@core/types/express';
import { ProjectModel } from '@features/projects/schemas';
import { AsyncController } from '@core/types/express';

export const ProjectController: AsyncController = {
  /**
   * Create a new project in the tenant
   * @requires requireTenantOwner - Only tenant owner can create projects
   */
  createProject: async (req: AuthRequest, res: Response): Promise<void> => {
    // Stub: Create project in tenant
    res.status(201).json({
      message: 'Project created successfully',
      projectId: 'stub-project-id'
    });
  },

  /**
   * List all projects in tenant
   * Returns empty array if user has no projects (not an error)
   * @requires requireProjectRole - Any role can list projects
   */
  listProjects: async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    
    // Stub: List all projects user has access to
    const hasProjects = Math.random() > 0.5;  // Simulate random projects existence
    
    // Return empty array if no projects (not an error)
    const projects = hasProjects ? [
      {
        id: 'stub-project-1',
        name: 'Stub Project 1',
        description: 'A stub project',
        tenantId: 'stub-tenant-1',
        createdBy: userId,
        role: 'OWNER',
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ] : [];

    res.status(200).json({
      data: projects,
      meta: {
        requestId: req.id,
        pagination: {
          total: projects.length,
          page: 1,
          limit: 10
        }
      }
    });
  },

  /**
   * Get project by ID
   * Returns 404 if project doesn't exist (this IS an error)
   * @requires requireProjectRole - Any role can view project
   */
  getProject: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user.id;

    // Stub: Check if project exists
    const exists = id === 'stub-project-1';  // Simulate project existence check

    // Return 404 if project doesn't exist (this IS an error)
    if (!exists) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          message: `Project ${id} not found`,
          requestId: req.id
        }
      });
      return;
    }

    // Return project details
    res.status(200).json({
      data: {
        id,
        name: 'Stub Project',
        description: 'A stub project',
        tenantId: 'stub-tenant-1',
        createdBy: userId,
        role: 'OWNER',
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      meta: {
        requestId: req.id
      }
    });
  },

  /**
   * Update project name or archive status
   * @requires requireProjectRole('admin') - Only admins can update project
   */
  updateProject: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Stub: Update project details
    res.status(200).json({
      message: 'Project updated successfully',
      projectId: id
    });
  },

  /**
   * Delete/archive project
   * @requires requireProjectRole('admin') - Only admins can delete project
   */
  deleteProject: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Stub: Soft-delete project
    res.status(200).json({
      message: 'Project archived successfully',
      projectId: id
    });
  }
};