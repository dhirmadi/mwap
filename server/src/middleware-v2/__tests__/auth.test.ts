import "@jest/globals";
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core-v2/errors';
import { extractUser, requireRoles, requireSuperAdmin } from '../auth';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('extractUser', () => {
    it('should extract user from valid token', () => {
      const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInRlbmFudElkIjoidGVuYW50LTEyMyIsImlzU3VwZXJBZG1pbiI6dHJ1ZX0.dummy';
      mockReq.headers = { authorization: token };

      extractUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        sub: 'user-123',
        tenantId: 'tenant-123',
        isSuperAdmin: true,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle missing token', () => {
      extractUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.unauthorized('No authorization token provided')
      );
    });

    it('should handle invalid token format', () => {
      mockReq.headers = { authorization: 'NotBearer token' };

      extractUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.unauthorized('Invalid token format')
      );
    });

    it('should handle malformed token', () => {
      mockReq.headers = { authorization: 'Bearer not.a.jwt' };

      extractUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.unauthorized('Invalid token format')
      );
    });
  });

  describe('requireRoles', () => {
    beforeEach(() => {
      mockReq.user = {
        sub: 'user-123',
        tenantId: 'tenant-123',
        roles: ['USER'],
      };
    });

    it('should allow user with required role', () => {
      const middleware = requireRoles(['USER']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow user with any required role', () => {
      mockReq.user!.roles = ['ADMIN', 'USER'];
      const middleware = requireRoles(['USER', 'EDITOR']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block user without required role', () => {
      const middleware = requireRoles(['ADMIN']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('Insufficient permissions')
      );
    });

    it('should handle missing user', () => {
      mockReq.user = undefined;
      const middleware = requireRoles(['USER']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.unauthorized('User not authenticated')
      );
    });
  });

  describe('requireSuperAdmin', () => {
    it('should allow superadmin', () => {
      const user = {
        sub: 'user-123',
        tenantId: 'tenant-123',
        isSuperAdmin: true,
      };

      requireSuperAdmin(user);
      // No error thrown
    });

    it('should block non-superadmin', () => {
      const user = {
        sub: 'user-123',
        tenantId: 'tenant-123',
        isSuperAdmin: false,
      };

      expect(() => requireSuperAdmin(user)).toThrow(
        AppError.forbidden('Superadmin access required')
      );
    });

    it('should handle missing user', () => {
      expect(() => requireSuperAdmin(undefined)).toThrow(
        AppError.unauthorized('User not authenticated')
      );
    });
  });
});