import "@jest/globals";
import { AppError } from '../../../core-v2/errors';
import { logger } from '../../../core-v2/logger';
import { requireSuperAdmin } from '../../../middleware-v2/auth';
import { ProjectTypeModel } from '../model';
import { ProjectTypeService } from '../service';

jest.mock('../../../core-v2/logger');
jest.mock('../../../middleware-v2/auth');
jest.mock('../model', () => ({
  ProjectTypeModel: {
    findById: jest.fn(),
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('ProjectTypeService', () => {
  let service: ProjectTypeService;
  const mockUser = {
    sub: 'user-123',
    tenantId: 'tenant-123',
    isSuperAdmin: true,
  };

  const mockProjectType = {
    id: 'type-123',
    name: 'Test Type',
    description: 'Test description',
    schema: {
      fields: [
        {
          name: 'title',
          type: 'text' as const,
          label: 'Title',
          required: true,
        },
      ],
    },
    active: true,
    createdAt: new Date('2025-05-04T17:48:44.931Z'),
    updatedAt: new Date('2025-05-04T17:48:44.931Z'),
  };

  beforeEach(() => {
    service = new ProjectTypeService();
    jest.clearAllMocks();

    // Mock project type operations
    (ProjectTypeModel.findById as jest.Mock).mockResolvedValue(mockProjectType);
    (ProjectTypeModel.findOne as jest.Mock).mockResolvedValue(null);
    (ProjectTypeModel.findMany as jest.Mock).mockResolvedValue([mockProjectType]);
    (ProjectTypeModel.create as jest.Mock).mockResolvedValue(undefined);
    (ProjectTypeModel.update as jest.Mock).mockResolvedValue(undefined);

    // Mock superadmin check
    (requireSuperAdmin as jest.Mock).mockReturnValue(undefined);
  });

  describe('createProjectType', () => {
    const createInput = {
      name: 'New Type',
      description: 'New description',
      schema: {
        fields: [
          {
            name: 'title',
            type: 'text' as const,
            label: 'Title',
            required: true,
          },
        ],
      },
    };

    it('should create project type as superadmin', async () => {
      const projectType = await service.createProjectType(mockUser, createInput);

      expect(requireSuperAdmin).toHaveBeenCalledWith(mockUser);

      expect(ProjectTypeModel.findOne).toHaveBeenCalledWith({
        name: createInput.name,
      });

      expect(projectType).toMatchObject({
        name: createInput.name,
        description: createInput.description,
        schema: createInput.schema,
        active: true,
      });

      expect(ProjectTypeModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createInput.name,
          description: createInput.description,
          schema: createInput.schema,
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'createProjectType',
          user: expect.any(Object),
          projectType: expect.any(Object),
        })
      );
    });

    it('should throw error when name exists', async () => {
      (ProjectTypeModel.findOne as jest.Mock).mockResolvedValue(mockProjectType);

      await expect(
        service.createProjectType(mockUser, createInput)
      ).rejects.toThrow(AppError.validation('Project type with this name already exists'));
    });

    it('should throw error when not superadmin', async () => {
      (requireSuperAdmin as jest.Mock).mockImplementation(() => {
        throw AppError.forbidden('Superadmin access required');
      });

      await expect(
        service.createProjectType({ ...mockUser, isSuperAdmin: false }, createInput)
      ).rejects.toThrow(AppError.forbidden('Superadmin access required'));
    });
  });

  describe('listProjectTypes', () => {
    it('should list all types for superadmin', async () => {
      const types = await service.listProjectTypes(mockUser, true);

      expect(ProjectTypeModel.findMany).toHaveBeenCalledWith({});

      expect(types).toHaveLength(1);
      expect(types[0]).toEqual({
        id: mockProjectType.id,
        name: mockProjectType.name,
        description: mockProjectType.description,
        schema: mockProjectType.schema,
        active: mockProjectType.active,
        createdAt: mockProjectType.createdAt,
      });
    });

    it('should list only active types for regular user', async () => {
      await service.listProjectTypes({ ...mockUser, isSuperAdmin: false });

      expect(ProjectTypeModel.findMany).toHaveBeenCalledWith({
        active: true,
      });
    });
  });

  describe('updateProjectType', () => {
    const updateInput = {
      description: 'Updated description',
      schema: {
        fields: [
          {
            name: 'title',
            type: 'text' as const,
            label: 'Updated Title',
            required: true,
          },
        ],
      },
    };

    it('should update project type as superadmin', async () => {
      const projectType = await service.updateProjectType(
        'type-123',
        mockUser,
        updateInput
      );

      expect(requireSuperAdmin).toHaveBeenCalledWith(mockUser);

      expect(projectType).toMatchObject({
        id: mockProjectType.id,
        name: mockProjectType.name,
        description: updateInput.description,
        schema: updateInput.schema,
      });

      expect(ProjectTypeModel.update).toHaveBeenCalledWith(
        'type-123',
        expect.objectContaining({
          description: updateInput.description,
          schema: updateInput.schema,
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'updateProjectType',
          user: expect.any(Object),
          projectType: expect.any(Object),
          changes: expect.any(Object),
        })
      );
    });

    it('should throw error when type not found', async () => {
      (ProjectTypeModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateProjectType('invalid', mockUser, updateInput)
      ).rejects.toThrow(AppError.notFound('Project type not found'));
    });
  });

  describe('getProjectType', () => {
    it('should return type for superadmin', async () => {
      const projectType = await service.getProjectType('type-123', mockUser);

      expect(projectType).toEqual({
        id: mockProjectType.id,
        name: mockProjectType.name,
        description: mockProjectType.description,
        schema: mockProjectType.schema,
        active: mockProjectType.active,
        createdAt: mockProjectType.createdAt,
      });
    });

    it('should return active type for regular user', async () => {
      const projectType = await service.getProjectType('type-123', {
        ...mockUser,
        isSuperAdmin: false,
      });

      expect(projectType).toEqual({
        id: mockProjectType.id,
        name: mockProjectType.name,
        description: mockProjectType.description,
        schema: mockProjectType.schema,
        active: mockProjectType.active,
        createdAt: mockProjectType.createdAt,
      });
    });

    it('should hide inactive type from regular user', async () => {
      (ProjectTypeModel.findById as jest.Mock).mockResolvedValue({
        ...mockProjectType,
        active: false,
      });

      await expect(
        service.getProjectType('type-123', { ...mockUser, isSuperAdmin: false })
      ).rejects.toThrow(AppError.notFound('Project type not found'));
    });
  });

  describe('deactivateProjectType', () => {
    it('should deactivate type as superadmin', async () => {
      await service.deactivateProjectType('type-123', mockUser);

      expect(requireSuperAdmin).toHaveBeenCalledWith(mockUser);

      expect(ProjectTypeModel.update).toHaveBeenCalledWith(
        'type-123',
        expect.objectContaining({
          active: false,
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'deactivateProjectType',
          user: expect.any(Object),
          projectType: expect.any(Object),
        })
      );
    });

    it('should throw error when type not found', async () => {
      (ProjectTypeModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deactivateProjectType('invalid', mockUser)
      ).rejects.toThrow(AppError.notFound('Project type not found'));
    });
  });
});