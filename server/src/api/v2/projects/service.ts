import { ProjectCreateSchema, type ProjectCreateInput } from './schema';
import { AppError } from '@core/errors';
import { Project } from '@models/v2/project.model';
import type { User } from '@models/v2/user.model';

export class ProjectService {
  static async createProject(user: User, payload: ProjectCreateInput) {
    const validationResult = ProjectCreateSchema.safeParse(payload);
    
    if (!validationResult.success) {
      throw new AppError('Invalid input', 400, validationResult.error.format());
    }

    const existingProject = await Project.findOne({
      folderId: payload.folderId,
      tenantId: user.tenantId,
      archived: false
    });

    if (existingProject) {
      throw new AppError('Project already exists for this folder', 409);
    }

    const project = new Project({
      ...payload,
      ownerId: user.id,
      tenantId: user.tenantId,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await project.save();
    return project;
  }

  static async getProject(projectId: string, userId: string) {
    const project = await Project.findOne({ _id: projectId, archived: false });
    
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  static async updateProject(projectId: string, userId: string, updates: Partial<ProjectCreateInput>) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, archived: false },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  static async archiveProject(projectId: string, userId: string) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, archived: false },
      { archived: true, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }
}