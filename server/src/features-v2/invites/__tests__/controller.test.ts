import "@jest/globals";
import { Request, Response } from 'express';
import { AppError } from '../../../core-v2/errors';
import { InviteController } from '../controller';
import { InviteService } from '../service';

jest.mock('../service');

describe('InviteController', () => {
  let controller: InviteController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const mockUser = {
    sub: 'user-123',
    tenantId: 'tenant-123',
  };

  const mockInvite = {
    code: 'ABC123XYZ',
    role: 'MEMBER' as const,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  beforeEach(() => {
    controller = new InviteController();
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
    const service = InviteService.prototype;
    service.createInvite = jest.fn().mockResolvedValue(mockInvite);
    service.listInvites = jest.fn().mockResolvedValue([mockInvite]);
    service.redeemInvite = jest.fn().mockResolvedValue({
      projectId: 'project-123',
      role: 'MEMBER',
    });
    service.revokeInvite = jest.fn().mockResolvedValue(undefined);
    service.resendInvite = jest.fn().mockResolvedValue(mockInvite);
  });

  describe('createInvite', () => {
    const validInput = {
      projectId: 'project-123',
      role: 'MEMBER',
    };

    it('should create invite with valid input', async () => {
      mockReq.body = validInput;

      await controller.createInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockInvite);
    });

    it('should validate required fields', async () => {
      mockReq.body = {};

      await controller.createInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should validate role enum', async () => {
      mockReq.body = {
        ...validInput,
        role: 'INVALID',
      };

      await controller.createInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('listInvites', () => {
    it('should list invites for project', async () => {
      mockReq.params = { projectId: 'project-123' };

      await controller.listInvites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith([mockInvite]);
    });

    it('should require project id', async () => {
      await controller.listInvites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('redeemInvite', () => {
    it('should redeem invite with valid code', async () => {
      mockReq.params = { code: 'ABC123XYZ' };

      await controller.redeemInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        projectId: 'project-123',
        role: 'MEMBER',
      });
    });

    it('should handle expired invite', async () => {
      const error = AppError.gone('Invite has expired');
      InviteService.prototype.redeemInvite = jest.fn().mockRejectedValue(error);

      mockReq.params = { code: 'EXPIRED' };

      await controller.redeemInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle invalid code', async () => {
      const error = AppError.notFound('Invite not found');
      InviteService.prototype.redeemInvite = jest.fn().mockRejectedValue(error);

      mockReq.params = { code: 'INVALID' };

      await controller.redeemInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('revokeInvite', () => {
    it('should revoke invite with valid code', async () => {
      mockReq.params = { code: 'ABC123XYZ' };

      await controller.revokeInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith();
    });

    it('should handle not found error', async () => {
      const error = AppError.notFound('Invite not found');
      InviteService.prototype.revokeInvite = jest.fn().mockRejectedValue(error);

      mockReq.params = { code: 'INVALID' };

      await controller.revokeInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('resendInvite', () => {
    it('should resend invite with valid code', async () => {
      mockReq.params = { code: 'ABC123XYZ' };

      await controller.resendInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockInvite);
    });

    it('should handle not found error', async () => {
      const error = AppError.notFound('Invite not found');
      InviteService.prototype.resendInvite = jest.fn().mockRejectedValue(error);

      mockReq.params = { code: 'INVALID' };

      await controller.resendInvite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});