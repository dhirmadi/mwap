import "@jest/globals";
import { Request, Response } from 'express';
import { AppError } from '../../../core-v2/errors';
import { TenantController } from '../controller';
import { TenantService } from '../service';

jest.mock('../service');

describe('TenantController', () => {
  let controller: TenantController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const mockUser = {
    sub: 'user-123',
    tenantId: 'tenant-123',
    isSuperAdmin: true,
  };

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Tenant',
    ownerId: 'user-123',
    createdAt: new Date(),
    active: true,
  };

  beforeEach(() => {
    controller = new TenantController();
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
    const service = TenantService.prototype;
    service.createTenant = jest.fn().mockResolvedValue(mockTenant);
    service.listTenants = jest.fn().mockResolvedValue([mockTenant]);
    service.updateTenant = jest.fn().mockResolvedValue(mockTenant);
    service.getTenant = jest.fn().mockResolvedValue(mockTenant);
    service.deactivateTenant = jest.fn().mockResolvedValue(undefined);
  });

  describe('createTenant', () => {
    const validInput = {
      name: 'New Tenant',
      ownerId: 'user-123',
    };

    it('should create tenant with valid input', async () => {
      mockReq.body = validInput;

      await controller.createTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockTenant);
    });

    it('should validate required fields', async () => {
      mockReq.body = {};

      await controller.createTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should require superadmin', async () => {
      mockReq.user = { ...mockUser, isSuperAdmin: false };
      mockReq.body = validInput;

      await controller.createTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('Superadmin access required')
      );
    });
  });

  describe('listTenants', () => {
    it('should list tenants', async () => {
      await controller.listTenants(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith([mockTenant]);
    });

    it('should handle includeInactive query', async () => {
      mockReq.query = { includeInactive: 'true' };

      await controller.listTenants(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(TenantService.prototype.listTenants).toHaveBeenCalledWith(
        mockUser,
        true
      );
    });

    it('should require superadmin', async () => {
      mockReq.user = { ...mockUser, isSuperAdmin: false };

      await controller.listTenants(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('Superadmin access required')
      );
    });
  });

  describe('updateTenant', () => {
    const validInput = {
      name: 'Updated Tenant',
    };

    it('should update tenant with valid input', async () => {
      mockReq.params = { id: 'tenant-123' };
      mockReq.body = validInput;

      await controller.updateTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockTenant);
    });

    it('should validate input', async () => {
      mockReq.params = { id: 'tenant-123' };
      mockReq.body = { name: '' };

      await controller.updateTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should require superadmin', async () => {
      mockReq.user = { ...mockUser, isSuperAdmin: false };
      mockReq.params = { id: 'tenant-123' };
      mockReq.body = validInput;

      await controller.updateTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('Superadmin access required')
      );
    });
  });

  describe('getTenant', () => {
    it('should return tenant by id', async () => {
      mockReq.params = { id: 'tenant-123' };

      await controller.getTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockTenant);
    });

    it('should handle not found error', async () => {
      const error = AppError.notFound('Tenant not found');
      TenantService.prototype.getTenant = jest.fn().mockRejectedValue(error);

      mockReq.params = { id: 'invalid' };

      await controller.getTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should require superadmin', async () => {
      mockReq.user = { ...mockUser, isSuperAdmin: false };
      mockReq.params = { id: 'tenant-123' };

      await controller.getTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('Superadmin access required')
      );
    });
  });

  describe('deactivateTenant', () => {
    it('should deactivate tenant', async () => {
      mockReq.params = { id: 'tenant-123' };

      await controller.deactivateTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith();
    });

    it('should handle not found error', async () => {
      const error = AppError.notFound('Tenant not found');
      TenantService.prototype.deactivateTenant = jest
        .fn()
        .mockRejectedValue(error);

      mockReq.params = { id: 'invalid' };

      await controller.deactivateTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should require superadmin', async () => {
      mockReq.user = { ...mockUser, isSuperAdmin: false };
      mockReq.params = { id: 'tenant-123' };

      await controller.deactivateTenant(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('Superadmin access required')
      );
    });
  });
});