/**
 * This module uses core-v2 only
 */

import { v4 as uuid } from 'uuid';
import { AppError } from '../../core-v2/errors';
import { logger } from '../../core-v2/logger';
import { requireSuperAdmin } from '../../middleware-v2/auth';
import {
  ProjectTypeModel,
  type ProjectType,
  type ProjectTypeDTO,
  type ProjectTypeSchema,
} from './model';

export interface CreateProjectTypeInput {
  name: string;
  description: string;
  schema: ProjectTypeSchema;
}

export interface UpdateProjectTypeInput {
  description?: string;
  schema?: ProjectTypeSchema;
  active?: boolean;
}

export class ProjectTypeService {
  async createProjectType(
    user: { sub: string; isSuperAdmin?: boolean },
    data: CreateProjectTypeInput
  ): Promise<ProjectTypeDTO> {
    try {
      // Enforce superadmin access
      requireSuperAdmin(user);

      // Check for duplicate name
      const existing = await ProjectTypeModel.findOne({ name: data.name });
      if (existing) {
        throw AppError.validation('Project type with this name already exists');
      }

      // Create project type
      const projectType: ProjectType = {
        id: uuid(),
        name: data.name,
        description: data.description,
        schema: data.schema,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save project type
      await ProjectTypeModel.create(projectType);

      // Log creation
      logger.info({
        action: 'createProjectType',
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
        projectType: {
          id: projectType.id,
          name: projectType.name,
        },
      });

      // Return DTO
      return {
        id: projectType.id,
        name: projectType.name,
        description: projectType.description,
        schema: projectType.schema,
        active: projectType.active,
        createdAt: projectType.createdAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'createProjectType',
        error,
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
        projectType: {
          name: data.name,
        },
      });
      throw AppError.internal('Failed to create project type');
    }
  }

  async listProjectTypes(
    user: { sub: string; isSuperAdmin?: boolean },
    includeInactive = false
  ): Promise<ProjectTypeDTO[]> {
    try {
      // Build query
      const query = user.isSuperAdmin && includeInactive ? {} : { active: true };

      // Load project types
      const projectTypes = await ProjectTypeModel.findMany(query);

      // Return DTOs
      return projectTypes.map((type) => ({
        id: type.id,
        name: type.name,
        description: type.description,
        schema: type.schema,
        active: type.active,
        createdAt: type.createdAt,
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'listProjectTypes',
        error,
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
      });
      throw AppError.internal('Failed to list project types');
    }
  }

  async updateProjectType(
    id: string,
    user: { sub: string; isSuperAdmin?: boolean },
    data: UpdateProjectTypeInput
  ): Promise<ProjectTypeDTO> {
    try {
      // Enforce superadmin access
      requireSuperAdmin(user);

      // Load project type
      const projectType = await ProjectTypeModel.findById(id);
      if (!projectType) {
        throw AppError.notFound('Project type not found');
      }

      // Update fields
      const updated = {
        ...projectType,
        ...(data.description && { description: data.description }),
        ...(data.schema && { schema: data.schema }),
        ...(typeof data.active === 'boolean' && { active: data.active }),
        updatedAt: new Date(),
      };

      // Save changes
      await ProjectTypeModel.update(id, updated);

      // Log update
      logger.info({
        action: 'updateProjectType',
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
        projectType: {
          id,
          name: projectType.name,
        },
        changes: {
          description: data.description,
          schema: !!data.schema,
          active: data.active,
        },
      });

      // Return DTO
      return {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        schema: updated.schema,
        active: updated.active,
        createdAt: updated.createdAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'updateProjectType',
        error,
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
        projectType: {
          id,
        },
      });
      throw AppError.internal('Failed to update project type');
    }
  }

  async getProjectType(
    id: string,
    user: { sub: string; isSuperAdmin?: boolean }
  ): Promise<ProjectTypeDTO> {
    try {
      // Load project type
      const projectType = await ProjectTypeModel.findById(id);
      if (!projectType) {
        throw AppError.notFound('Project type not found');
      }

      // Check access
      if (!projectType.active && !user.isSuperAdmin) {
        throw AppError.notFound('Project type not found');
      }

      // Return DTO
      return {
        id: projectType.id,
        name: projectType.name,
        description: projectType.description,
        schema: projectType.schema,
        active: projectType.active,
        createdAt: projectType.createdAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'getProjectType',
        error,
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
        projectType: {
          id,
        },
      });
      throw AppError.internal('Failed to get project type');
    }
  }

  async deactivateProjectType(
    id: string,
    user: { sub: string; isSuperAdmin?: boolean }
  ): Promise<void> {
    try {
      // Enforce superadmin access
      requireSuperAdmin(user);

      // Load project type
      const projectType = await ProjectTypeModel.findById(id);
      if (!projectType) {
        throw AppError.notFound('Project type not found');
      }

      // Update status
      const updated = {
        ...projectType,
        active: false,
        updatedAt: new Date(),
      };

      // Save changes
      await ProjectTypeModel.update(id, updated);

      // Log deactivation
      logger.info({
        action: 'deactivateProjectType',
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
        projectType: {
          id,
          name: projectType.name,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'deactivateProjectType',
        error,
        user: {
          id: user.sub,
          isSuperAdmin: user.isSuperAdmin,
        },
        projectType: {
          id,
        },
      });
      throw AppError.internal('Failed to deactivate project type');
    }
  }
}
