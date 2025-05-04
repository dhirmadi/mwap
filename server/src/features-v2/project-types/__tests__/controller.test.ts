import "@jest/globals";
import { Request, Response } from 'express';
import { AppError, ValidationError } from '../../../core-v2/errors';
import { ProjectTypeController } from '../controller';
import { ProjectTypeService } from '../service';

jest.mock('../service');

describe('ProjectTypeController', () => {
  let controller: ProjectTypeController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

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
    createdAt: new Date(),
  };

  beforeEach(() => {
    controller = new ProjectTypeController();
    mockReq = {
      user: mockUser,
      params: {},
      query: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Mock service methods
    jest.spyOn(ProjectTypeService.prototype, 'createProjectType').mockResolvedValue(mockProjectType);
    jest.spyOn(ProjectTypeService.prototype, 'listProjectTypes').mockResolvedValue([mockProjectType]);
    jest.spyOn(ProjectTypeService.prototype, 'updateProjectType').mockResolvedValue(mockProjectType);
    jest.spyOn(ProjectTypeService.prototype, 'getProjectType').mockResolvedValue(mockProjectType);
    jest.spyOn(ProjectTypeService.prototype, 'deactivateProjectType').mockResolvedValue(undefined);
  });

  describe('createProjectType', () => {
    const validInput = {
      name: 'New Type',
      description: 'New description',
      schema: {
        fields: [
          {
            name: 'title',
            type: 'text',
            label: 'Title',
            required: true,
          },
        ],
      },
    };

    it('should create project type with valid input', async () => {
      mockReq.body = validInput;

      await controller.createProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockProjectType);
    });

    it('should validate required fields', async () => {
      mockReq.body = {};

      await controller.createProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should forward service errors', async () => {
      const error = new ValidationError('Invalid input');
      jest.spyOn(ProjectTypeService.prototype, 'createProjectType').mockRejectedValue(error);

      mockReq.body = validInput;

      await controller.createProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listProjectTypes', () => {
    it('should list project types', async () => {
      await controller.listProjectTypes(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith([mockProjectType]);
    });

    it('should handle includeInactive query', async () => {
      mockReq.query = { includeInactive: 'true' };

      await controller.listProjectTypes(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(ProjectTypeService.prototype.listProjectTypes).toHaveBeenCalledWith(
        mockUser,
        true
      );
    });
  });

  describe('updateProjectType', () => {
    const validInput = {
      description: 'Updated description',
      schema: {
        fields: [
          {
            name: 'title',
            type: 'text',
            label: 'Updated Title',
            required: true,
          },
        ],
      },
    };

    it('should update project type with valid input', async () => {
      mockReq.params = { id: 'type-123' };
      mockReq.body = validInput;

      await controller.updateProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockProjectType);
    });

    it('should validate input schema', async () => {
      mockReq.params = { id: 'type-123' };
      mockReq.body = {
        schema: { invalid: true },
      };

      await controller.updateProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should block name changes', async () => {
      mockReq.params = { id: 'type-123' };
      mockReq.body = {
        name: 'New Name',
      };

      await controller.updateProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('getProjectType', () => {
    it('should return project type by id', async () => {
      mockReq.params = { id: 'type-123' };

      await controller.getProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockProjectType);
    });

    it('should handle not found error', async () => {
      const error = AppError.notFound('Project type not found');
      jest.spyOn(ProjectTypeService.prototype, 'getProjectType').mockRejectedValue(error);

      mockReq.params = { id: 'invalid' };

      await controller.getProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deactivateProjectType', () => {
    it('should deactivate project type', async () => {
      mockReq.params = { id: 'type-123' };

      await controller.deactivateProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith();
    });

    it('should handle not found error', async () => {
      const error = AppError.notFound('Project type not found');
      jest.spyOn(ProjectTypeService.prototype, 'deactivateProjectType').mockRejectedValue(error);

      mockReq.params = { id: 'invalid' };

      await controller.deactivateProjectType(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});