/**
 * This module uses core-v2 only
 */

import { v4 as uuid } from 'uuid';
import { AppError } from '../../core-v2/errors';
import { logger } from '../../core-v2/logger';
import { getProviderClient, StorageProvider } from '../../providers-v2';
import { TenantModel } from '../tenants/model';
import { getStorageToken } from '../tenants/storage';
import { ProjectModel, type Project, type ProjectListItem } from './model';
import { canAccessProject, getMemberRole, verifyProjectRole } from './members';

export interface CreateProjectInput {
  name: string;
  description?: string;
  typeId: string;
  storageProvider: StorageProvider;
  storagePath: string;
  tenantId: string;
  createdBy: string;
}

export class ProjectService {
  async createProject(input: CreateProjectInput): Promise<Project> {
    // Validate storage provider
    const provider = StorageProvider.safeParse(input.storageProvider);
    if (!provider.success) {
      throw AppError.validation('Invalid storage provider');
    }

    // Get tenant storage token
    const tenant = await TenantModel.findById(input.tenantId);
    if (!tenant) {
      throw AppError.notFound('Tenant not found');
    }

    // Get storage token
    let token: string;
    try {
      token = getStorageToken(tenant.storage, provider.data);
    } catch (error) {
      throw AppError.unauthorized(`Storage provider ${provider.data} not configured for tenant`);
    }

    // Validate folder with provider
    const providerClient = getProviderClient(provider.data);
    try {
      const isValid = await providerClient.validateFolder(input.storagePath, token);
      if (!isValid) {
        throw AppError.badRequest('Invalid storage folder');
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to validate storage folder');
    }

    // Create project
    const project: Project = {
      id: uuid(),
      name: input.name,
      description: input.description,
      tenantId: input.tenantId,
      typeId: input.typeId,
      status: 'active',
      storageProvider: provider.data,
      storagePath: input.storagePath,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    try {
      await ProjectModel.create(project);
    } catch (error) {
      throw AppError.internal('Failed to create project');
    }

    // Log success
    logger.info({
      action: 'createProject',
      project: {
        id: project.id,
        name: project.name,
        tenantId: project.tenantId,
        provider: project.storageProvider,
      },
      user: {
        id: input.createdBy,
        tenantId: input.tenantId,
      },
    });

    return project;
  }

  async getProject(id: string, userId: string, userTenantId: string): Promise<Project> {
    // Get project and members in parallel
    const [project, members] = await Promise.all([
      ProjectModel.findById(id),
      ProjectModel.getMembers(id),
    ]);

    // Check project exists
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    // Check tenant access
    if (project.tenantId !== userTenantId) {
      throw AppError.forbidden('Project belongs to a different tenant');
    }

    // Check member access
    if (!canAccessProject(members, userId)) {
      throw AppError.forbidden('User is not a member of this project');
    }

    // Log access
    logger.info({
      action: 'getProject',
      project: {
        id: project.id,
        name: project.name,
      },
      user: {
        id: userId,
        tenantId: userTenantId,
        role: getMemberRole(members, userId),
      },
    });

    return project;
  }

  async updateProject(
    id: string,
    data: { name: string },
    userId: string,
    userTenantId: string
  ): Promise<Project> {
    // Get project
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    // Check tenant access
    if (project.tenantId !== userTenantId) {
      throw AppError.forbidden('Project belongs to a different tenant');
    }

    // Verify user has owner role
    try {
      await verifyProjectRole(id, userId, ['owner'], ProjectModel);
    } catch (error) {
      throw AppError.forbidden('Only project owners can update project name');
    }

    // Validate name
    if (!data.name || data.name.length < 2 || data.name.length > 100) {
      throw AppError.validation('Name must be between 2 and 100 characters');
    }

    // Update project
    const updated = {
      ...project,
      name: data.name,
      updatedAt: new Date(),
    };

    try {
      await ProjectModel.update(id, updated);
    } catch (error) {
      throw AppError.internal('Failed to update project');
    }

    // Log update
    logger.info({
      action: 'updateProject',
      project: {
        id: project.id,
        name: data.name,
      },
      user: {
        id: userId,
        tenantId: userTenantId,
      },
      changes: {
        name: {
          from: project.name,
          to: data.name,
        },
      },
    });

    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    await ProjectModel.delete(id);
  }

  async listProjects(userId: string, userTenantId: string): Promise<ProjectListItem[]> {
    try {
      // Get all active projects in tenant where user is a member
      const projects = await ProjectModel.findByQuery({
        tenantId: userTenantId,
        status: 'active',
        memberId: userId,
      });

      // Map to DTO
      return projects.map(project => ({
        id: project.id,
        name: project.name,
        typeId: project.typeId,
        createdAt: project.createdAt,
      }));
    } catch (error) {
      logger.error({
        action: 'listProjects',
        error,
        user: {
          id: userId,
          tenantId: userTenantId,
        },
      });
      throw AppError.internal('Failed to list projects');
    }
  }

  async archiveProject(
    id: string,
    userId: string,
    userTenantId: string
  ): Promise<Project> {
    // Get project
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    // Check tenant access
    if (project.tenantId !== userTenantId) {
      throw AppError.forbidden('Project belongs to a different tenant');
    }

    // Verify user has owner role
    try {
      await verifyProjectRole(id, userId, ['owner'], ProjectModel);
    } catch (error) {
      throw AppError.forbidden('Only project owners can archive projects');
    }

    // Don't re-archive
    if (project.status === 'archived') {
      throw AppError.validation('Project is already archived');
    }

    // Update project
    const updated = {
      ...project,
      status: 'archived' as const,
      updatedAt: new Date(),
    };

    try {
      await ProjectModel.update(id, updated);
    } catch (error) {
      throw AppError.internal('Failed to archive project');
    }

    // Log update
    logger.info({
      action: 'archiveProject',
      project: {
        id: project.id,
        name: project.name,
      },
      user: {
        id: userId,
        tenantId: userTenantId,
      },
      changes: {
        status: {
          from: project.status,
          to: 'archived',
        },
      },
    });

    return updated;
  }

  async restoreProject(
    id: string,
    userId: string,
    userTenantId: string
  ): Promise<Project> {
    // Get project
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    // Check tenant access
    if (project.tenantId !== userTenantId) {
      throw AppError.forbidden('Project belongs to a different tenant');
    }

    // Verify user has owner role
    try {
      await verifyProjectRole(id, userId, ['owner'], ProjectModel);
    } catch (error) {
      throw AppError.forbidden('Only project owners can restore projects');
    }

    // Don't restore if not archived
    if (project.status !== 'archived') {
      throw AppError.validation('Project is not archived');
    }

    // Update project
    const updated = {
      ...project,
      status: 'active' as const,
      updatedAt: new Date(),
    };

    try {
      await ProjectModel.update(id, updated);
    } catch (error) {
      throw AppError.internal('Failed to restore project');
    }

    // Log update
    logger.info({
      action: 'restoreProject',
      project: {
        id: project.id,
        name: project.name,
      },
      user: {
        id: userId,
        tenantId: userTenantId,
      },
      changes: {
        status: {
          from: project.status,
          to: 'active',
        },
      },
    });

    return updated;
  }
}
