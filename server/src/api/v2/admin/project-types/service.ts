import { ProjectTypeModel } from '@models/v2/projectType.model';
import { ProjectTypeCreateSchema, ProjectTypeUpdateSchema } from './schema';
import { AppError } from '@core/errors/appError';
import type { ProjectTypeCreate, ProjectTypeUpdate } from './schema';

export class ProjectTypeService {
  static async createProjectType(payload: ProjectTypeCreate) {
    const validationResult = ProjectTypeCreateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    try {
      const projectType = new ProjectTypeModel(payload);
      await projectType.save();
      return projectType;
    } catch (error) {
      if ((error as any).code === 11000) {
        throw AppError.badRequest('Project type ID already exists');
      }
      throw error;
    }
  }

  static async listProjectTypes() {
    return ProjectTypeModel.find().sort({ name: 1 });
  }

  static async updateProjectType(projectTypeId: string, payload: ProjectTypeUpdate) {
    const validationResult = ProjectTypeUpdateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    const projectType = await ProjectTypeModel.findOneAndUpdate(
      { projectTypeId },
      { ...payload, updatedAt: new Date() },
      { new: true }
    );

    if (!projectType) {
      throw AppError.notFound('Project type not found');
    }

    return projectType;
  }

  static async deleteProjectType(projectTypeId: string) {
    const projectType = await ProjectTypeModel.findOneAndDelete({ projectTypeId });
    
    if (!projectType) {
      throw AppError.notFound('Project type not found');
    }

    return projectType;
  }
}