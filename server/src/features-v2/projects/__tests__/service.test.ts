import "@jest/globals";
import { ProjectService, type CreateProjectInput } from '../service';
import { TenantModel } from '../../tenants/model';
import { ProjectModel } from '../model';
import { getProviderClient } from '../../../providers-v2';
import { AppError } from '../../../core-v2/errors';
import { logger } from '../../../core-v2/logger';

// Mock dependencies
jest.mock('../../tenants/model');
jest.mock('../model');
jest.mock('../../../providers-v2');
jest.mock('../../../core-v2/logger');

describe('ProjectService', () => {
  let service: ProjectService;
  const mockTenant = {
    id: 'tenant-123',
    storage: {
      tokens: [
        {
          provider: 'dropbox',
          token: 'valid-token',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  };

  const mockProject = {
    id: 'project-123',
    name: 'Test Project',
    description: 'Test Description',
    typeId: 'type-123',
    storageProvider: 'dropbox' as const,
    storagePath: '/test/folder',
    tenantId: 'tenant-123',
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMembers = {
    projectId: 'project-123',
    members: [
      {
        userId: 'user-123',
        role: 'owner' as const,
        addedAt: new Date(),
        addedBy: 'system',
      },
      {
        userId: 'user-456',
        role: 'viewer' as const,
        addedAt: new Date(),
        addedBy: 'user-123',
      },
    ],
  };

  const mockInput: CreateProjectInput = {
    name: 'Test Project',
    description: 'Test Description',
    typeId: 'type-123',
    storageProvider: 'dropbox',
    storagePath: '/test/folder',
    tenantId: 'tenant-123',
    createdBy: 'user-123',
  };

  beforeEach(() => {
    service = new ProjectService();
    jest.clearAllMocks();

    // Mock tenant lookup
    jest.spyOn(TenantModel, 'findById').mockResolvedValue(mockTenant);

    // Mock provider validation
    jest.spyOn(getProviderClient as any, 'default').mockReturnValue({
      validateFolder: jest.fn().mockResolvedValue(true),
    });

    // Mock project operations
    jest.spyOn(ProjectModel, 'create').mockResolvedValue(undefined);
    jest.spyOn(ProjectModel, 'findById').mockResolvedValue(mockProject);
    jest.spyOn(ProjectModel, 'getMembers').mockResolvedValue(mockMembers);
  });

  describe('createProject', () => {
    it('should create a project with valid input', async () => {
      const project = await service.createProject(mockInput);

      expect(project).toMatchObject({
        name: mockInput.name,
        description: mockInput.description,
        typeId: mockInput.typeId,
        storageProvider: mockInput.storageProvider,
        storagePath: mockInput.storagePath,
        tenantId: mockInput.tenantId,
        status: 'active',
      });

      expect(TenantModel.findById).toHaveBeenCalledWith(mockInput.tenantId);
      expect(getProviderClient).toHaveBeenCalledWith(mockInput.storageProvider);
      expect(ProjectModel.create).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'createProject',
          project: expect.any(Object),
          user: expect.any(Object),
        })
      );
    });

    it('should throw error for invalid storage provider', async () => {
      const input = { ...mockInput, storageProvider: 'invalid' as any };
      await expect(service.createProject(input)).rejects.toThrow(AppError);
    });

    it('should throw error when tenant not found', async () => {
      jest.spyOn(TenantModel, 'findById').mockResolvedValue(null);
      await expect(service.createProject(mockInput)).rejects.toThrow(
        AppError.notFound('Tenant not found')
      );
    });

    it('should throw error when provider token not found', async () => {
      const tenant = {
        ...mockTenant,
        storage: { tokens: [] },
      };
      jest.spyOn(TenantModel, 'findById').mockResolvedValue(tenant);

      await expect(service.createProject(mockInput)).rejects.toThrow(
        AppError.unauthorized('Storage provider dropbox not configured for tenant')
      );
    });

    it('should throw error when folder validation fails', async () => {
      jest.spyOn(getProviderClient as any, 'default').mockReturnValue({
        validateFolder: jest.fn().mockResolvedValue(false),
      });

      await expect(service.createProject(mockInput)).rejects.toThrow(
        AppError.badRequest('Invalid storage folder')
      );
    });

    it('should throw error when folder validation errors', async () => {
      jest.spyOn(getProviderClient as any, 'default').mockReturnValue({
        validateFolder: jest.fn().mockRejectedValue(new Error('Provider error')),
      });

      await expect(service.createProject(mockInput)).rejects.toThrow(
        AppError.internal('Failed to validate storage folder')
      );
    });

    it('should throw error when project creation fails', async () => {
      jest.spyOn(ProjectModel, 'create').mockRejectedValue(
        new Error('Database error')
      );

      await expect(service.createProject(mockInput)).rejects.toThrow(
        AppError.internal('Failed to create project')
      );
    });
  });

  describe('getProject', () => {
    it('should return project for authorized member', async () => {
      const project = await service.getProject(
        'project-123',
        'user-123',
        'tenant-123'
      );

      expect(project).toEqual(mockProject);
      expect(ProjectModel.findById).toHaveBeenCalledWith('project-123');
      expect(ProjectModel.getMembers).toHaveBeenCalledWith('project-123');
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'getProject',
          project: expect.any(Object),
          user: expect.objectContaining({
            id: 'user-123',
            role: 'owner',
          }),
        })
      );
    });

    it('should throw error when project not found', async () => {
      jest.spyOn(ProjectModel, 'findById').mockResolvedValue(null);

      await expect(
        service.getProject('project-123', 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.notFound('Project not found'));
    });

    it('should throw error when user is not in tenant', async () => {
      await expect(
        service.getProject('project-123', 'user-123', 'wrong-tenant')
      ).rejects.toThrow(AppError.forbidden('Project belongs to a different tenant'));
    });

    it('should throw error when user is not a member', async () => {
      await expect(
        service.getProject('project-123', 'user-789', 'tenant-123')
      ).rejects.toThrow(AppError.forbidden('User is not a member of this project'));
    });
  });

  describe('updateProject', () => {
    const updateInput = { name: 'Updated Project Name' };

    it('should update project name for owner', async () => {
      const project = await service.updateProject(
        'project-123',
        updateInput,
        'user-123',
        'tenant-123'
      );

      expect(project).toMatchObject({
        ...mockProject,
        name: updateInput.name,
        updatedAt: expect.any(Date),
      });

      expect(ProjectModel.update).toHaveBeenCalledWith('project-123', expect.objectContaining({
        name: updateInput.name,
        updatedAt: expect.any(Date),
      }));

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'updateProject',
          project: expect.any(Object),
          user: expect.any(Object),
          changes: {
            name: {
              from: mockProject.name,
              to: updateInput.name,
            },
          },
        })
      );
    });

    it('should throw error when project not found', async () => {
      jest.spyOn(ProjectModel, 'findById').mockResolvedValue(null);

      await expect(
        service.updateProject('project-123', updateInput, 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.notFound('Project not found'));
    });

    it('should throw error when user is not in tenant', async () => {
      await expect(
        service.updateProject('project-123', updateInput, 'user-123', 'wrong-tenant')
      ).rejects.toThrow(AppError.forbidden('Project belongs to a different tenant'));
    });

    it('should throw error when user is not owner', async () => {
      await expect(
        service.updateProject('project-123', updateInput, 'user-456', 'tenant-123')
      ).rejects.toThrow(AppError.forbidden('Only project owners can update project name'));
    });

    it('should throw error for invalid name', async () => {
      await expect(
        service.updateProject('project-123', { name: 'a' }, 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.validation('Name must be between 2 and 100 characters'));

      await expect(
        service.updateProject('project-123', { name: 'x'.repeat(101) }, 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.validation('Name must be between 2 and 100 characters'));
    });

    it('should throw error when update fails', async () => {
      jest.spyOn(ProjectModel, 'update').mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateProject('project-123', updateInput, 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.internal('Failed to update project'));
    });
  });

  describe('archiveProject', () => {
    it('should archive active project for owner', async () => {
      const project = await service.archiveProject(
        'project-123',
        'user-123',
        'tenant-123'
      );

      expect(project).toMatchObject({
        ...mockProject,
        status: 'archived',
        updatedAt: expect.any(Date),
      });

      expect(ProjectModel.update).toHaveBeenCalledWith('project-123', expect.objectContaining({
        status: 'archived',
        updatedAt: expect.any(Date),
      }));

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'archiveProject',
          project: expect.any(Object),
          user: expect.any(Object),
          changes: {
            status: {
              from: 'active',
              to: 'archived',
            },
          },
        })
      );
    });

    it('should throw error when project not found', async () => {
      jest.spyOn(ProjectModel, 'findById').mockResolvedValue(null);

      await expect(
        service.archiveProject('project-123', 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.notFound('Project not found'));
    });

    it('should throw error when user is not in tenant', async () => {
      await expect(
        service.archiveProject('project-123', 'user-123', 'wrong-tenant')
      ).rejects.toThrow(AppError.forbidden('Project belongs to a different tenant'));
    });

    it('should throw error when user is not owner', async () => {
      await expect(
        service.archiveProject('project-123', 'user-456', 'tenant-123')
      ).rejects.toThrow(AppError.forbidden('Only project owners can archive projects'));
    });

    it('should throw error when project already archived', async () => {
      const archivedProject = {
        ...mockProject,
        status: 'archived' as const,
      };
      (ProjectModel.findById as jest.Mock).mockResolvedValue(archivedProject);

      await expect(
        service.archiveProject('project-123', 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.validation('Project is already archived'));
    });

    it('should throw error when archive fails', async () => {
      jest.spyOn(ProjectModel, 'update').mockRejectedValue(new Error('Database error'));

      await expect(
        service.archiveProject('project-123', 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.internal('Failed to archive project'));
    });
  });

  describe('restoreProject', () => {
    beforeEach(() => {
      // Mock archived project
      jest.spyOn(ProjectModel, 'findById').mockResolvedValue({
        ...mockProject,
        status: 'archived',
      });
    });

    it('should restore archived project for owner', async () => {
      const project = await service.restoreProject(
        'project-123',
        'user-123',
        'tenant-123'
      );

      expect(project).toMatchObject({
        ...mockProject,
        status: 'active',
        updatedAt: expect.any(Date),
      });

      expect(ProjectModel.update).toHaveBeenCalledWith('project-123', expect.objectContaining({
        status: 'active',
        updatedAt: expect.any(Date),
      }));

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'restoreProject',
          project: expect.any(Object),
          user: expect.any(Object),
          changes: {
            status: {
              from: 'archived',
              to: 'active',
            },
          },
        })
      );
    });

    it('should throw error when project not found', async () => {
      jest.spyOn(ProjectModel, 'findById').mockResolvedValue(null);

      await expect(
        service.restoreProject('project-123', 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.notFound('Project not found'));
    });

    it('should throw error when user is not in tenant', async () => {
      await expect(
        service.restoreProject('project-123', 'user-123', 'wrong-tenant')
      ).rejects.toThrow(AppError.forbidden('Project belongs to a different tenant'));
    });

    it('should throw error when user is not owner', async () => {
      await expect(
        service.restoreProject('project-123', 'user-456', 'tenant-123')
      ).rejects.toThrow(AppError.forbidden('Only project owners can restore projects'));
    });

    it('should throw error when project not archived', async () => {
      jest.spyOn(ProjectModel, 'findById').mockResolvedValue(mockProject); // active project

      await expect(
        service.restoreProject('project-123', 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.validation('Project is not archived'));
    });

    it('should throw error when restore fails', async () => {
      jest.spyOn(ProjectModel, 'update').mockRejectedValue(new Error('Database error'));

      await expect(
        service.restoreProject('project-123', 'user-123', 'tenant-123')
      ).rejects.toThrow(AppError.internal('Failed to restore project'));
    });
  });

  describe('listProjects', () => {
    const mockProjects = [
      {
        ...mockProject,
        id: 'project-1',
        name: 'Project 1',
      },
      {
        ...mockProject,
        id: 'project-2',
        name: 'Project 2',
      },
    ];

    beforeEach(() => {
      jest.spyOn(ProjectModel, 'findByQuery').mockResolvedValue(mockProjects);
    });

    it('should return list of active projects for member', async () => {
      const projects = await service.listProjects('user-123', 'tenant-123');

      expect(projects).toHaveLength(2);
      expect(projects[0]).toEqual({
        id: 'project-1',
        name: 'Project 1',
        typeId: mockProject.typeId,
        createdAt: mockProject.createdAt,
      });

      expect(ProjectModel.findByQuery).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        status: 'active',
        memberId: 'user-123',
      });
    });

    it('should return empty array when no projects found', async () => {
      jest.spyOn(ProjectModel, 'findByQuery').mockResolvedValue([]);

      const projects = await service.listProjects('user-123', 'tenant-123');
      expect(projects).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      jest.spyOn(ProjectModel, 'findByQuery').mockRejectedValue(new Error('Database error'));

      await expect(
        service.listProjects('user-123', 'tenant-123')
      ).rejects.toThrow(AppError.internal('Failed to list projects'));

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'listProjects',
          error: expect.any(Error),
          user: {
            id: 'user-123',
            tenantId: 'tenant-123',
          },
        })
      );
    });
  });
});