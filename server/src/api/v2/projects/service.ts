import { Types } from 'mongoose';
import { ProjectModel } from '@models/v2/project.model';
import { TenantModel } from '@models/v2/tenant.model';
import { CloudProviderModel } from '@models/v2/cloudProvider.model';
import { ProjectTypeModel } from '@models/v2/projectType.model';
import { ProjectCreateSchema, ProjectUpdateSchema } from './schema';
import { AppError } from '@core/errors';
import type { User } from '@models/v2/user.model';
import type { ProjectCreate, ProjectUpdate } from './schema';

export class ProjectService {
  static async createProject(user: User, payload: ProjectCreate) {
    const validationResult = ProjectCreateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    // Verify tenant exists and user has access
    const tenant = await TenantModel.findOne({
      _id: payload.tenantId,
      ownerId: user._id,
      archived: false
    });

    if (!tenant) {
      throw AppError.forbidden('Not authorized to create projects for this tenant');
    }

    // Verify cloud provider exists
    const provider = await CloudProviderModel.findOne({
      providerId: payload.cloudProvider,
      archived: false
    });

    if (!provider) {
      throw AppError.badRequest('Invalid cloud provider');
    }

    // Verify project type exists
    const projectType = await ProjectTypeModel.findOne({
      projectTypeId: payload.projectTypeId,
      archived: false
    });

    if (!projectType) {
      throw AppError.badRequest('Invalid project type');
    }

    try {
      const project = new ProjectModel({
        ...payload,
        ownerId: user._id
      });
      await project.save();
      return project;
    } catch (error: any) {
      if (error.code === 11000) {
        throw AppError.badRequest('A project already exists with this folder in the tenant');
      }
      throw error;
    }
  }

  static async getProject(projectId: string) {
    const project = await ProjectModel.findById(projectId);
    
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    return project;
  }

  static async updateProject(projectId: string, payload: ProjectUpdate) {
    const validationResult = ProjectUpdateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId, archived: false },
      { ...payload, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      throw AppError.notFound('Project not found or archived');
    }

    return project;
  }

  static async archiveProject(projectId: string) {
    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId, archived: false },
      { archived: true, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      throw AppError.notFound('Project not found or already archived');
    }

    return project;
  }
}